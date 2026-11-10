package org.binaryheart.auth;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.inject.Inject;
import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import io.javalin.http.UnauthorizedResponse;
import org.binaryheart.models.ChapterRole;

public class JwtAccessManager {

	private static final String[] PUBLIC_PATHS = {"/swagger", "/webjars/", "/openapi"};
	private final CentralTokenVerifier central;

	@Inject
	public JwtAccessManager(CentralTokenVerifier central) {
		this.central = central;
	}

	public void handle(Context ctx) {
		if (ctx.routeRoles().contains(AppRole.PUBLIC)) {
			return;
		}

		for (String path : PUBLIC_PATHS) {
			if (ctx.path().startsWith(path)) {
				return;
			}
		}

		String token = extractToken(ctx);
		if (token == null) {
			throw new UnauthorizedResponse();
		}

		if (token.length() > 32768) {
			throw new UnauthorizedResponse();
		}
		DecodedJWT jwt = central.verify(token);
		if (jwt == null) {
			throw new UnauthorizedResponse();
		}

		try {
			CentralClaims claims = CentralClaims.from(jwt);
			ctx.attribute("accountId", claims.accountId());
			ctx.attribute("username", claims.username());
			ctx.attribute("chapterIds", claims.chapterRoles().stream().map(ChapterRole::chapterId).toList());
			ctx.attribute("chapterRoles", claims.chapterRoles());
			ctx.attribute("role", claims.role());
		} catch (IllegalArgumentException | com.auth0.jwt.exceptions.JWTDecodeException e) {
			throw new UnauthorizedResponse("Invalid central identity or no Inventory access");
		}

		// Role-based access checks (AUTHENTICATED passes any valid JWT)
		if (ctx.routeRoles().contains(AppRole.ADMIN)) {
			if (!"Admin".equals(ctx.attribute("role"))) {
				throw new ForbiddenResponse();
			}
		} else if (ctx.routeRoles().contains(AppRole.INVENTORY_ADMIN)) {
			String role = ctx.attribute("role");
			if (!"Admin".equals(role) && !"Inventory Admin".equals(role)) {
				throw new ForbiddenResponse();
			}
		} else if (ctx.routeRoles().contains(AppRole.CHAPTER_ADMIN)) {
			String role = ctx.attribute("role");
			if (!"Admin".equals(role) && !"Chapter Admin".equals(role) && !"Inventory Admin".equals(role)) {
				throw new ForbiddenResponse();
			}
		}
	}

	private static String extractToken(Context ctx) {
		String header = ctx.header("Authorization");
		if (header != null && header.startsWith("Bearer ")) {
			return header.substring(7);
		}
		return null;
	}
}
