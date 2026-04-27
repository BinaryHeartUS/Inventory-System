package org.binaryheart.auth;

import com.auth0.jwt.interfaces.DecodedJWT;
import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import io.javalin.http.UnauthorizedResponse;
import org.binaryheart.models.ChapterRole;

import java.util.ArrayList;
import java.util.List;

public class JwtAccessManager {

    private static final String[] PUBLIC_PATHS = { "/swagger", "/webjars/", "/openapi" };

    public static void handle(Context ctx) {
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

        DecodedJWT jwt = JwtService.verify(token);
        if (jwt == null) {
            throw new UnauthorizedResponse();
        }

        // Reconstruct per-chapter roles from parallel arrays stored in JWT
        List<Integer> chapterIds = jwt.getClaim("chapterIds").asList(Integer.class);
        List<String> chapterRoleNames = jwt.getClaim("chapterRoles").asList(String.class);
        List<ChapterRole> chapterRoles = new ArrayList<>();
        if (chapterIds != null && chapterRoleNames != null) {
            for (int i = 0; i < Math.min(chapterIds.size(), chapterRoleNames.size()); i++) {
                chapterRoles.add(new ChapterRole(chapterIds.get(i), chapterRoleNames.get(i)));
            }
        }

        // Attach claims to context so downstream handlers can use them
        ctx.attribute("volunteerId", Integer.parseInt(jwt.getSubject()));
        ctx.attribute("username", jwt.getClaim("username").asString());
        ctx.attribute("chapterIds", chapterIds != null ? chapterIds : new ArrayList<Integer>());
        ctx.attribute("chapterRoles", chapterRoles);
        ctx.attribute("role", jwt.getClaim("role").asString());

        // Role-based access checks (AUTHENTICATED passes any valid JWT)
        if (ctx.routeRoles().contains(AppRole.ADMIN)) {
            if (!"Admin".equals(ctx.attribute("role"))) {
                throw new ForbiddenResponse();
            }
        } else if (ctx.routeRoles().contains(AppRole.CHAPTER_ADMIN)) {
            String role = ctx.attribute("role");
            if (!"Admin".equals(role) && !"Chapter Admin".equals(role)) {
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
