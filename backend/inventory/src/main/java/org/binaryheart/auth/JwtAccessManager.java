package org.binaryheart.auth;

import com.auth0.jwt.interfaces.DecodedJWT;
import io.javalin.http.Context;
import io.javalin.http.UnauthorizedResponse;

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

        // Attach claims to context so downstream handlers can use them
        ctx.attribute("volunteerId", Integer.parseInt(jwt.getSubject()));
        ctx.attribute("username", jwt.getClaim("username").asString());
        ctx.attribute("chapterIds", jwt.getClaim("chapterIds").asList(Integer.class));
    }

    private static String extractToken(Context ctx) {
        String header = ctx.header("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
