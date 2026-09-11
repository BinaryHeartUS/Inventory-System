package org.binaryheart.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import java.time.Instant;
import java.util.List;
import org.binaryheart.models.ChapterRole;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

	@Test
	void createIncludesAllClaims() {
		String token = new JwtService().create(7, "user",
			List.of(new ChapterRole(2, "Editor"), new ChapterRole(3, "Viewer")), "Editor");
		DecodedJWT jwt = JWT.decode(token);

		assertNotNull(jwt);
		assertEquals("7", jwt.getSubject());
		assertEquals("user", jwt.getClaim("username").asString());
		assertEquals(List.of(2, 3), jwt.getClaim("chapterIds").asList(Integer.class));
		assertEquals(List.of("Editor", "Viewer"), jwt.getClaim("chapterRoles").asList(String.class));
		assertEquals("Editor", jwt.getClaim("role").asString());
		assertTrue(jwt.getExpiresAtAsInstant().isAfter(jwt.getIssuedAtAsInstant()));
	}

	@Test
	void verifyReturnsDecodedJwtForValidToken() {
		String secret = System.getenv().getOrDefault("JWT_SECRET", "dev-secret-change-in-production");
		String token = JWT.create().withSubject("7").withExpiresAt(Instant.now().plusSeconds(60))
			.sign(Algorithm.HMAC256(secret));

		DecodedJWT jwt = new JwtService().verify(token);

		assertNotNull(jwt);
		assertEquals("7", jwt.getSubject());
	}

	@Test
	void verifyReturnsNullForInvalidToken() {
		assertNull(new JwtService().verify("not-a-token"));
	}
}