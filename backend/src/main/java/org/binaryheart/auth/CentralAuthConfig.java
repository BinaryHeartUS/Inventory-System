package org.binaryheart.auth;

import java.net.URI;
import java.util.Map;

public record CentralAuthConfig(String issuer, String clientId, String jwksUrl) {
	public CentralAuthConfig(String issuer, String clientId) {
		this(issuer, clientId, issuer + "/.well-known/jwks.json");
	}

	public static CentralAuthConfig fromEnvironment() {
		return from(System.getenv());
	}

	public static CentralAuthConfig from(Map<String, String> env) {
		String issuer = env.getOrDefault("AUTH_ISSUER", "");
		URI uri = URI.create(issuer);
		boolean local = "http".equals(uri.getScheme())
			&& ("localhost".equals(uri.getHost()) || "127.0.0.1".equals(uri.getHost()));
		if ((!local && !"https".equals(uri.getScheme())) || uri.getHost() == null || uri.getRawUserInfo() != null
			|| uri.getRawQuery() != null || uri.getRawFragment() != null
			|| (uri.getPath() != null && !uri.getPath().isEmpty())) {
			throw new IllegalArgumentException(
				"AUTH_ISSUER must be an HTTPS origin without a trailing slash (HTTP localhost allowed)");
		}
		String jwksUrl = env.getOrDefault("AUTH_JWKS_URL", issuer + "/.well-known/jwks.json");
		URI jwks = URI.create(jwksUrl);
		if (!("https".equals(jwks.getScheme()) || "http".equals(jwks.getScheme())) || jwks.getHost() == null
			|| jwks.getRawUserInfo() != null || jwks.getRawQuery() != null || jwks.getRawFragment() != null) {
			throw new IllegalArgumentException(
				"AUTH_JWKS_URL must be an HTTP(S) URL without credentials or query parameters");
		}
		return new CentralAuthConfig(issuer, "inventory", jwksUrl);
	}
}
