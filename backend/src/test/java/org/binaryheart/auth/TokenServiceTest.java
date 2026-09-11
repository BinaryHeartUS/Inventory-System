package org.binaryheart.auth;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import org.binaryheart.models.ChapterRole;
import org.junit.jupiter.api.Test;

class TokenServiceTest {

	@Test
	void createDelegatesEveryClaimToJwtService() {
		JwtService jwtService = mock(JwtService.class);
		List<ChapterRole> roles = List.of(new ChapterRole(2, "Editor"));
		expect(jwtService.create(7, "user", roles, "Editor")).andReturn("token");
		replay(jwtService);

		assertEquals("token", new TokenService(jwtService).create(7, "user", roles, "Editor"));

		verify(jwtService);
	}
}