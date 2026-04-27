package org.binaryheart.auth;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.binaryheart.models.ChapterRole;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

public class JwtService {

    private static final String SECRET = System.getenv().getOrDefault("JWT_SECRET", "dev-secret-change-in-production");
    private static final Algorithm ALGORITHM = Algorithm.HMAC256(SECRET);
    private static final long EXPIRY_HOURS = 8;

    public static String create(int volunteerId, String username, List<ChapterRole> chapterRoles,
            String effectiveRole) {
        List<Integer> chapterIds = chapterRoles.stream().map(ChapterRole::chapterId).collect(Collectors.toList());
        List<String> roles = chapterRoles.stream().map(ChapterRole::role).collect(Collectors.toList());
        return JWT.create().withSubject(String.valueOf(volunteerId)).withClaim("username", username)
                .withClaim("chapterIds", chapterIds).withClaim("chapterRoles", roles).withClaim("role", effectiveRole)
                .withIssuedAt(Instant.now()).withExpiresAt(Instant.now().plus(EXPIRY_HOURS, ChronoUnit.HOURS))
                .sign(ALGORITHM);
    }

    public static DecodedJWT verify(String token) {
        try {
            return JWT.require(ALGORITHM).build().verify(token);
        } catch (JWTVerificationException e) {
            return null;
        }
    }
}
