package org.binaryheart.auth;

import io.javalin.security.RouteRole;

/**
 * Defines the permission roles used by the access manager.
 *
 * <p>
 * PUBLIC - No authentication required (health checks, auth configuration).
 * AUTHENTICATED - Any account with a valid BinaryHeart access token may access.
 * CHAPTER_ADMIN - Requires 'Chapter Admin' or 'Admin' role in JWT. ADMIN -
 * Requires 'Admin' role in JWT.
 */
public enum AppRole implements RouteRole {
	PUBLIC, AUTHENTICATED, CHAPTER_ADMIN, ADMIN
}
