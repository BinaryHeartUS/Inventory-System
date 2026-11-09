package org.binaryheart.auth;

import static org.junit.jupiter.api.Assertions.*;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator;
import com.auth0.jwt.algorithms.Algorithm;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import io.javalin.Javalin;
import io.javalin.http.ServiceUnavailableResponse;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.time.Clock;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.binaryheart.controllers.AuthController;
import org.binaryheart.models.ChapterRole;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static io.javalin.apibuilder.ApiBuilder.path;

class CentralAuthTest {
	private HttpServer jwks;
	private KeyPair pair;
	private CentralAuthConfig config;
	private CentralTokenVerifier verifier;
	private final AtomicInteger requests = new AtomicInteger();
	private int status = 200;
	private String document;

	@BeforeEach
	void setup() throws Exception {
		pair = KeyPairGenerator.getInstance("RSA").generateKeyPair();
		RSAPublicKey publicKey = (RSAPublicKey) pair.getPublic();
		document = new ObjectMapper().writeValueAsString(Map.of("keys",
			List.of(Map.of("kty", "RSA", "alg", "RS256", "use", "sig", "kid", "test", "n",
				unsigned(publicKey.getModulus().toByteArray()), "e",
				unsigned(publicKey.getPublicExponent().toByteArray())))));
		jwks = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
		jwks.createContext("/.well-known/jwks.json", exchange -> {
			requests.incrementAndGet();
			byte[] body = document.getBytes(java.nio.charset.StandardCharsets.UTF_8);
			exchange.sendResponseHeaders(status, body.length);
			try (var output = exchange.getResponseBody()) {
				output.write(body);
			}
		});
		jwks.start();
		config = new CentralAuthConfig("http://127.0.0.1:" + jwks.getAddress().getPort(), "inventory");
		verifier = new CentralTokenVerifier(config);
	}

	@AfterEach
	void close() {
		jwks.stop(0);
	}

	@Test
	void issuerIsRequiredAndInvalidConfigFailsClosed() {
		assertThrows(IllegalArgumentException.class, () -> CentralAuthConfig.from(Map.of()));
		assertEquals("https://auth.binaryheart.dev",
			CentralAuthConfig.from(Map.of("AUTH_ISSUER", "https://auth.binaryheart.dev")).issuer());
		for (String issuer : List.of("http://auth.binaryheart.dev", "https://auth.binaryheart.dev/",
			"https://user@auth.binaryheart.dev", "https://auth.binaryheart.dev?x=1")) {
			assertThrows(IllegalArgumentException.class, () -> CentralAuthConfig.from(Map.of("AUTH_ISSUER", issuer)));
		}
		assertEquals("http://auth-api:8081/.well-known/jwks.json", CentralAuthConfig.from(Map.of("AUTH_ISSUER",
			"http://localhost:8082", "AUTH_JWKS_URL", "http://auth-api:8081/.well-known/jwks.json")).jwksUrl());
	}

	@Test
	void verifiesAndCachesCentralKeysAndMapsChapterRoles() {
		String token = sign(builder());
		var verified = verifier.verify(token);
		assertNotNull(verified);
		assertNotNull(verifier.verify(token));
		assertEquals(1, requests.get());
		CentralClaims claims = CentralClaims.from(verified);
		assertEquals(42, claims.accountId());
		assertEquals("person", claims.username());
		assertEquals("Chapter Admin", claims.role());
		assertEquals(List.of(new ChapterRole(2, "Chapter Admin"), new ChapterRole(3, "Viewer")), claims.chapterRoles());
	}

	@Test
	void sharedAndApplicationRolesStaySeparateAndScoped() {
		var jwt = JWT.decode(sign(builder().withClaim("chapters",
			List.of(Map.of("id", 7, "roles", List.of("national_admin"), "app_roles", List.of()),
				Map.of("id", 2, "roles", List.of(), "app_roles", List.of("editor", "viewer")),
				Map.of("id", 3, "roles", List.of("unknown_future_role"), "app_roles", List.of())))));
		assertEquals(List.of(new ChapterRole(7, "Admin"), new ChapterRole(2, "Editor")),
			CentralClaims.from(jwt).chapterRoles());
		assertEquals("Admin", CentralClaims.from(jwt).role());
	}

	@Test
	void inventoryAdminIsNotASharedAdminAndKeepsChapterScope() {
		var jwt = JWT.decode(sign(builder().withClaim("chapters",
			List.of(Map.of("id", 2, "roles", List.of("chapter_admin"), "app_roles", List.of("admin", "editor")),
				Map.of("id", 3, "roles", List.of(), "app_roles", List.of("viewer"))))));
		assertEquals("Inventory Admin", CentralClaims.from(jwt).role());
		assertEquals(List.of(new ChapterRole(2, "Inventory Admin"), new ChapterRole(3, "Viewer")),
			CentralClaims.from(jwt).chapterRoles());
	}

	@Test
	void rejectsMalformedClaimsAndAccountsWithoutInventoryAccess() {
		for (Object chapterId : List.of(1.5, 0, -1, "2", 4_294_967_298L)) {
			var jwt = JWT.decode(sign(builder().withClaim("chapters",
				List.of(Map.of("id", chapterId, "roles", List.of(), "app_roles", List.of("viewer"))))));
			assertThrows(IllegalArgumentException.class, () -> CentralClaims.from(jwt));
		}
		assertThrows(IllegalArgumentException.class,
			() -> CentralClaims.from(JWT.decode(sign(builder().withClaim("chapters", List.of())))));
		assertThrows(IllegalArgumentException.class,
			() -> CentralClaims.from(JWT.decode(sign(builder().withSubject("not-an-id")))));
	}

	@ParameterizedTest
	@ValueSource(
		strings = {"issuer", "audience", "expiry", "missing-expiry", "type", "client", "issued-at", "signature",
				"algorithm", "kid"})
	void rejectsInvalidTokens(String failure) throws Exception {
		var builder = builder();
		String token = switch (failure) {
			case "issuer" -> sign(builder.withIssuer("https://other.invalid"));
			case "audience" -> sign(builder.withAudience("other"));
			case "expiry" -> sign(builder.withExpiresAt(Instant.now().minusSeconds(1)));
			case "missing-expiry" -> sign(builder.withExpiresAt((Instant) null));
			case "type" -> sign(builder.withHeader(Map.of("typ", "JWT")));
			case "client" -> sign(builder.withClaim("client_id", "other"));
			case "issued-at" -> sign(builder.withIssuedAt(Instant.now().plusSeconds(120)));
			case "kid" -> sign(builder.withKeyId("unknown"));
			case "algorithm" -> builder.sign(Algorithm.HMAC256("not-a-central-key"));
			case "signature" -> builder.sign(algorithm(KeyPairGenerator.getInstance("RSA").generateKeyPair()));
			default -> throw new AssertionError();
		};
		assertNull(verifier.verify(token));
		assertNull(verifier.verify("not-a-token"));
	}

	@Test
	void refreshesRotatedKeysAndEnforcesCacheAndRetryThresholds() {
		AtomicReference<Instant> now = new AtomicReference<>(Instant.now());
		Clock clock = new Clock() {
			public ZoneId getZone() {
				return ZoneOffset.UTC;
			}
			public Clock withZone(ZoneId zone) {
				return Clock.fixed(now.get(), zone);
			}
			public Instant instant() {
				return now.get();
			}
		};
		CentralTokenVerifier cached = new CentralTokenVerifier(config, clock);
		assertNotNull(cached.verify(sign(builder())));
		document = document.replace("\"kid\":\"test\"", "\"kid\":\"rotated\"");
		String rotated = sign(builder().withKeyId("rotated"));
		now.updateAndGet(time -> time.plusSeconds(9));
		assertNull(cached.verify(rotated));
		assertEquals(1, requests.get());
		now.updateAndGet(time -> time.plusSeconds(1));
		assertNotNull(cached.verify(rotated));
		assertEquals(2, requests.get());
		now.updateAndGet(time -> time.plusSeconds(299));
		assertNotNull(cached.verify(rotated));
		assertEquals(2, requests.get());
		now.updateAndGet(time -> time.plusSeconds(2));
		assertNotNull(cached.verify(rotated));
		assertEquals(3, requests.get());
		status = 503;
		now.updateAndGet(time -> time.plusSeconds(301));
		assertThrows(ServiceUnavailableResponse.class, () -> cached.verify(rotated));
		assertThrows(ServiceUnavailableResponse.class, () -> cached.verify(rotated));
		assertEquals(4, requests.get());
	}

	@Test
	void reportsKeyFailuresAsServiceUnavailableAndThrottlesRetries() {
		status = 503;
		assertThrows(ServiceUnavailableResponse.class, () -> verifier.verify(sign(builder())));
		assertThrows(ServiceUnavailableResponse.class, () -> verifier.verify(sign(builder())));
		assertEquals(1, requests.get());
	}

	@Test
	void rejectsOversizedAndEmptyKeyDocuments() {
		document = " ".repeat(65537);
		assertThrows(ServiceUnavailableResponse.class, () -> verifier.verify(sign(builder())));
		document = "";
		assertThrows(ServiceUnavailableResponse.class, () -> new CentralTokenVerifier(config).verify(sign(builder())));
	}

	@Test
	void centralSessionUsesVerifiedClaimsAndNeverCallsLocalLogin() throws Exception {
		JwtAccessManager access = new JwtAccessManager(verifier);
		Javalin app = Javalin.create(c -> {
			c.routes.beforeMatched(access::handle);
			c.routes.apiBuilder(() -> path("/api/auth", new AuthController(config)::registerRoutes));
		}).start(0);
		try {
			var http = HttpClient.newHttpClient();
			String origin = "http://localhost:" + app.port();
			var settings = http.send(HttpRequest.newBuilder(URI.create(origin + "/api/auth/config")).GET().build(),
				HttpResponse.BodyHandlers.ofString());
			assertEquals(200, settings.statusCode());
			var publicConfig = new ObjectMapper().readTree(settings.body());
			assertEquals(config.issuer(), publicConfig.path("issuer").asText());
			assertEquals("inventory", publicConfig.path("clientId").asText());
			assertFalse(publicConfig.has("enabled"));
			assertFalse(publicConfig.has("jwksUrl"));
			var response = http.send(
				HttpRequest.newBuilder(URI.create(origin + "/api/auth/session"))
					.header("Authorization", "Bearer " + sign(builder())).GET().build(),
				HttpResponse.BodyHandlers.ofString());
			assertEquals(200, response.statusCode());
			var json = new ObjectMapper().readTree(response.body());
			assertEquals("person", json.path("username").asText());
			assertEquals("Chapter Admin", json.path("role").asText());
			assertEquals(2, json.path("chapterRoles").get(0).path("chapterId").asInt());
			assertEquals("no-store", response.headers().firstValue("Cache-Control").orElseThrow());
			assertEquals(401, http.send(HttpRequest.newBuilder(URI.create(origin + "/api/auth/session")).GET().build(),
				HttpResponse.BodyHandlers.ofString()).statusCode());
			var oldToken = builder().sign(Algorithm.HMAC256("old-inventory-secret"));
			assertEquals(401,
				http.send(
					HttpRequest.newBuilder(URI.create(origin + "/api/auth/session"))
						.header("Authorization", "Bearer " + oldToken).GET().build(),
					HttpResponse.BodyHandlers.ofString()).statusCode());
			int loginStatus = http
				.send(HttpRequest.newBuilder(URI.create(origin + "/api/auth/login"))
					.header("Authorization", "Bearer " + sign(builder()))
					.POST(HttpRequest.BodyPublishers.ofString("{}")).build(), HttpResponse.BodyHandlers.ofString())
				.statusCode();
			assertEquals(404, loginStatus);
		} finally {
			app.stop();
		}
	}

	@Test
	void roleGatesUseOnlyVerifiedSharedAndInventoryRoles() throws Exception {
		JwtAccessManager access = new JwtAccessManager(verifier);
		Javalin app = Javalin.create(c -> {
			c.routes.beforeMatched(access::handle);
			c.routes.apiBuilder(() -> {
				io.javalin.apibuilder.ApiBuilder.get("/admin", ctx -> ctx.result("OK"), AppRole.ADMIN);
				io.javalin.apibuilder.ApiBuilder.get("/chapter-admin", ctx -> ctx.result("OK"), AppRole.CHAPTER_ADMIN);
				io.javalin.apibuilder.ApiBuilder.get("/inventory-admin", ctx -> ctx.result("OK"),
					AppRole.INVENTORY_ADMIN);
			});
		}).start(0);
		try {
			var http = HttpClient.newHttpClient();
			for (String role : List.of("viewer", "editor", "admin", "chapter_admin", "national_admin")) {
				boolean shared = role.equals("chapter_admin") || role.equals("national_admin");
				String token = sign(builder().withClaim("chapters", List.of(Map.of("id", 1, "roles",
					shared ? List.of(role) : List.of(), "app_roles", shared ? List.of() : List.of(role)))));
				for (String route : List.of("/admin", "/chapter-admin", "/inventory-admin")) {
					int expected = role.equals("national_admin")
						|| route.equals("/chapter-admin") && (shared || role.equals("admin"))
						|| route.equals("/inventory-admin") && role.equals("admin") ? 200 : 403;
					assertEquals(expected,
						http.send(
							HttpRequest.newBuilder(URI.create("http://localhost:" + app.port() + route))
								.header("Authorization", "Bearer " + token).GET().build(),
							HttpResponse.BodyHandlers.ofString()).statusCode(),
						role + route);
				}
			}
		} finally {
			app.stop();
		}
	}

	private JWTCreator.Builder builder() {
		return JWT.create().withHeader(Map.of("typ", "at+jwt")).withKeyId("test").withIssuer(config.issuer())
			.withAudience("inventory").withClaim("client_id", "inventory").withSubject("42")
			.withClaim("username", "person").withIssuedAt(Instant.now()).withExpiresAt(Instant.now().plusSeconds(3600))
			.withClaim("chapters",
				List.of(Map.of("id", 2, "roles", List.of("chapter_admin"), "app_roles", List.of("editor")),
					Map.of("id", 3, "roles", List.of(), "app_roles", List.of("viewer"))));
	}

	private String sign(JWTCreator.Builder builder) {
		return builder.sign(algorithm(pair));
	}

	private Algorithm algorithm(KeyPair key) {
		return Algorithm.RSA256((RSAPublicKey) key.getPublic(), (RSAPrivateKey) key.getPrivate());
	}

	private String unsigned(byte[] bytes) {
		if (bytes[0] == 0)
			bytes = java.util.Arrays.copyOfRange(bytes, 1, bytes.length);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}
}
