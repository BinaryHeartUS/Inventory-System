package org.binaryheart.auth;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import io.javalin.http.UnauthorizedResponse;
import io.javalin.security.RouteRole;
import java.util.List;
import java.util.Set;
import org.binaryheart.models.ChapterRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class JwtAccessManagerTest {

	@Test
	void publicRouteBypassesAuthentication() {
		JwtService jwtService = mock(JwtService.class);
		Context context = mock(Context.class);
		expect(context.routeRoles()).andReturn(Set.of(AppRole.PUBLIC));
		replay(jwtService, context);

		new JwtAccessManager(jwtService).handle(context);

		verify(jwtService, context);
	}

	@ParameterizedTest
	@ValueSource(strings = {"/swagger", "/webjars/library.js", "/openapi"})
	void documentedPublicPathsBypassAuthentication(String path) {
		JwtService jwtService = mock(JwtService.class);
		Context context = mock(Context.class);
		expect(context.routeRoles()).andReturn(Set.of(AppRole.AUTHENTICATED));
		expect(context.path()).andReturn(path).atLeastOnce();
		replay(jwtService, context);

		new JwtAccessManager(jwtService).handle(context);

		verify(jwtService, context);
	}

	@Test
	void missingAndInvalidBearerTokensAreUnauthorized() {
		JwtService jwtService = mock(JwtService.class);
		Context missing = unauthenticatedContext(null);
		Context invalid = unauthenticatedContext("Bearer invalid");
		expect(jwtService.verify("invalid")).andReturn(null);
		replay(jwtService);
		JwtAccessManager manager = new JwtAccessManager(jwtService);

		assertThrows(UnauthorizedResponse.class, () -> manager.handle(missing));
		assertThrows(UnauthorizedResponse.class, () -> manager.handle(invalid));

		verify(jwtService, missing, invalid);
	}

	@Test
	void validTokenAttachesClaimsToAuthenticatedContext() {
		JwtService jwtService = mock(JwtService.class);
		Context context = mock(Context.class);
		DecodedJWT jwt = mock(DecodedJWT.class);
		Claim chapterIds = mock(Claim.class);
		Claim chapterRoleNames = mock(Claim.class);
		Claim username = mock(Claim.class);
		Claim role = mock(Claim.class);
		expectAuthenticatedRequest(context, jwtService, jwt, Set.of(AppRole.AUTHENTICATED), 3);
		expectClaims(context, jwt, chapterIds, chapterRoleNames, username, role, "Editor");
		replay(jwtService, context, jwt, chapterIds, chapterRoleNames, username, role);

		new JwtAccessManager(jwtService).handle(context);

		verify(jwtService, context, jwt, chapterIds, chapterRoleNames, username, role);
	}

	@Test
	void adminRouteRejectsNonAdminRole() {
		JwtService jwtService = mock(JwtService.class);
		Context context = mock(Context.class);
		DecodedJWT jwt = mock(DecodedJWT.class);
		Claim chapterIds = mock(Claim.class);
		Claim chapterRoleNames = mock(Claim.class);
		Claim username = mock(Claim.class);
		Claim role = mock(Claim.class);
		expectAuthenticatedRequest(context, jwtService, jwt, Set.of(AppRole.ADMIN), 2);
		expectClaims(context, jwt, chapterIds, chapterRoleNames, username, role, "Editor");
		expect(context.<String>attribute("role")).andReturn("Editor");
		replay(jwtService, context, jwt, chapterIds, chapterRoleNames, username, role);

		assertThrows(ForbiddenResponse.class, () -> new JwtAccessManager(jwtService).handle(context));

		verify(jwtService, context, jwt, chapterIds, chapterRoleNames, username, role);
	}

	@Test
	void chapterAdminRouteAllowsChapterAdminRole() {
		JwtService jwtService = mock(JwtService.class);
		Context context = mock(Context.class);
		DecodedJWT jwt = mock(DecodedJWT.class);
		Claim chapterIds = mock(Claim.class);
		Claim chapterRoleNames = mock(Claim.class);
		Claim username = mock(Claim.class);
		Claim role = mock(Claim.class);
		expectAuthenticatedRequest(context, jwtService, jwt, Set.of(AppRole.CHAPTER_ADMIN), 3);
		expectClaims(context, jwt, chapterIds, chapterRoleNames, username, role, "Chapter Admin");
		expect(context.<String>attribute("role")).andReturn("Chapter Admin");
		replay(jwtService, context, jwt, chapterIds, chapterRoleNames, username, role);

		new JwtAccessManager(jwtService).handle(context);

		verify(jwtService, context, jwt, chapterIds, chapterRoleNames, username, role);
	}

	private Context unauthenticatedContext(String authorizationHeader) {
		Context context = mock(Context.class);
		expect(context.routeRoles()).andReturn(Set.of(AppRole.AUTHENTICATED));
		expect(context.path()).andReturn("/api/devices").times(3);
		expect(context.header("Authorization")).andReturn(authorizationHeader);
		replay(context);
		return context;
	}

	private void expectAuthenticatedRequest(Context context, JwtService jwtService, DecodedJWT jwt,
		Set<RouteRole> routeRoles, int roleReads) {
		expect(context.routeRoles()).andReturn(routeRoles).times(roleReads);
		expect(context.path()).andReturn("/api/devices").times(3);
		expect(context.header("Authorization")).andReturn("Bearer token");
		expect(jwtService.verify("token")).andReturn(jwt);
	}

	private void expectClaims(Context context, DecodedJWT jwt, Claim chapterIds, Claim chapterRoleNames,
		Claim username, Claim role, String effectiveRole) {
		List<Integer> ids = List.of(2, 3);
		List<String> names = List.of("Editor", "Viewer");
		expect(jwt.getClaim("chapterIds")).andReturn(chapterIds);
		expect(chapterIds.asList(Integer.class)).andReturn(ids);
		expect(jwt.getClaim("chapterRoles")).andReturn(chapterRoleNames);
		expect(chapterRoleNames.asList(String.class)).andReturn(names);
		expect(jwt.getSubject()).andReturn("7");
		expect(jwt.getClaim("username")).andReturn(username);
		expect(username.asString()).andReturn("user");
		expect(jwt.getClaim("role")).andReturn(role);
		expect(role.asString()).andReturn(effectiveRole);
		context.attribute("volunteerId", 7);
		context.attribute("username", "user");
		context.attribute("chapterIds", ids);
		context.attribute("chapterRoles", List.of(new ChapterRole(2, "Editor"), new ChapterRole(3, "Viewer")));
		context.attribute("role", effectiveRole);
	}
}