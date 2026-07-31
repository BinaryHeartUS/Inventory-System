package org.binaryheart.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.auth0.jwt.interfaces.DecodedJWT;
import java.util.List;
import org.binaryheart.models.ChapterRole;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

	@Test
	void createAndVerifyRoundTripAllClaims() {
		JwtService service = new JwtService();
		String token = service.create(7, "user",
			List.of(new ChapterRole(2, "Editor"), new ChapterRole(3, "Viewer")), "Editor");

		DecodedJWT jwt = service.verify(token);

		assertNotNull(jwt);
		assertEquals("7", jwt.getSubject());
		assertEquals("user", jwt.getClaim("username").asString());
		assertEquals(List.of(2, 3), jwt.getClaim("chapterIds").asList(Integer.class));
		assertEquals(List.of("Editor", "Viewer"), jwt.getClaim("chapterRoles").asList(String.class));
		assertEquals("Editor", jwt.getClaim("role").asString());
		assertTrue(jwt.getExpiresAtAsInstant().isAfter(jwt.getIssuedAtAsInstant()));
	}

	@Test
	void verifyReturnsNullForInvalidToken() {
		assertNull(new JwtService().verify("not-a-token"));
	}
}