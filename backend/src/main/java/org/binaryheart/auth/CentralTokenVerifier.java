package org.binaryheart.auth;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import io.javalin.http.ServiceUnavailableResponse;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.net.URI;
import java.net.HttpURLConnection;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.time.Instant;
import java.time.Clock;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Bounded JWKS cache. No token-provided URLs or algorithm negotiation. */
public class CentralTokenVerifier {
	private static final Logger LOG = LoggerFactory.getLogger(CentralTokenVerifier.class);
	private final CentralAuthConfig config;
	private final Clock clock;
	private final ObjectMapper json = new ObjectMapper();
	private Map<String, RSAPublicKey> keys = Map.of();
	private Instant loadedAt = Instant.EPOCH;
	private Instant attemptedAt = Instant.EPOCH;
	private boolean loadFailed;

	@Inject
	public CentralTokenVerifier(CentralAuthConfig config) {
		this(config, Clock.systemUTC());
	}

	CentralTokenVerifier(CentralAuthConfig config, Clock clock) {
		this.config = config;
		this.clock = clock;
	}

	public DecodedJWT verify(String token) {
		try {
			DecodedJWT decoded = JWT.decode(token);
			if (!"RS256".equals(decoded.getAlgorithm()) || !"at+jwt".equals(decoded.getType())
				|| decoded.getKeyId() == null || decoded.getKeyId().length() > 200 || decoded.getExpiresAt() == null
				|| decoded.getIssuedAt() == null || decoded.getSubject() == null) {
				return null;
			}
			RSAPublicKey key = key(decoded.getKeyId());
			if (key == null) {
				return null;
			}
			return JWT.require(Algorithm.RSA256(key, null)).withIssuer(config.issuer()).withAudience(config.clientId())
				.withClaim("client_id", config.clientId()).withClaimPresence("exp").withClaimPresence("iat")
				.withClaimPresence("sub").build().verify(decoded);
		} catch (JWTVerificationException | IllegalArgumentException e) {
			return null;
		}
	}

	private synchronized RSAPublicKey key(String kid) {
		Instant now = clock.instant();
		boolean expired = loadedAt.plusSeconds(300).isBefore(now);
		if (expired || !keys.containsKey(kid)) {
			// Throttle unknown-kid refreshes and failed requests to avoid request
			// amplification.
			if (attemptedAt.plusSeconds(10).isAfter(now)) {
				if (expired && loadFailed) {
					throw new ServiceUnavailableResponse("Authentication keys temporarily unavailable");
				}
				return expired ? null : keys.get(kid);
			}
			attemptedAt = now;
			HttpURLConnection connection = null;
			try {
				connection = (HttpURLConnection) URI.create(config.jwksUrl()).toURL().openConnection();
				connection.setConnectTimeout(3000);
				connection.setReadTimeout(5000);
				connection.setInstanceFollowRedirects(false);
				if (connection.getResponseCode() != 200) {
					throw new IOException("JWKS returned HTTP " + connection.getResponseCode());
				}
				try (InputStream body = connection.getInputStream()) {
					byte[] bytes = body.readNBytes(65537);
					if (bytes.length > 65536) {
						throw new IOException("JWKS exceeds size limit");
					}
					JsonNode document = json.readTree(bytes);
					if (document == null)
						throw new IOException("Empty JWKS response");
					JsonNode entries = document.path("keys");
					if (!entries.isArray() || entries.size() > 20) {
						throw new IOException("Invalid JWKS key collection");
					}
					Map<String, RSAPublicKey> refreshed = new HashMap<>();
					for (JsonNode entry : entries) {
						if (!"RSA".equals(entry.path("kty").asText()) || !"RS256".equals(entry.path("alg").asText())
							|| !"sig".equals(entry.path("use").asText())) {
							continue;
						}
						String id = entry.path("kid").asText();
						BigInteger n = new BigInteger(1, Base64.getUrlDecoder().decode(entry.path("n").asText()));
						BigInteger e = new BigInteger(1, Base64.getUrlDecoder().decode(entry.path("e").asText()));
						if (id.isEmpty() || n.bitLength() < 2048 || n.bitLength() > 8192 || refreshed.containsKey(id)) {
							throw new IOException("Invalid or duplicate RSA verification key");
						}
						RSAPublicKey publicKey = (RSAPublicKey) KeyFactory.getInstance("RSA")
							.generatePublic(new RSAPublicKeySpec(n, e));
						refreshed.put(id, publicKey);
					}
					if (refreshed.isEmpty()) {
						throw new IOException("No usable RSA signing keys");
					}
					keys = Map.copyOf(refreshed);
					loadedAt = now;
					loadFailed = false;
				}
			} catch (IOException | java.security.GeneralSecurityException | IllegalArgumentException e) {
				loadFailed = true;
				LOG.error("Could not load central authentication keys", e);
				throw new ServiceUnavailableResponse("Authentication keys temporarily unavailable");
			} finally {
				if (connection != null)
					connection.disconnect();
			}
		}
		return keys.get(kid);
	}
}
