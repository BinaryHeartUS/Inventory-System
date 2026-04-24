package org.binaryheart.auth;

import io.javalin.security.RouteRole;

/**
 * Defines the permission roles used by the access manager.
 *
 * PUBLIC - No authentication required (health checks, login endpoint).
 * AUTHENTICATED - Any volunteer with a valid JWT may access.
 *
 * Finer-grained roles (e.g. EDITOR, ADMIN) can be added here later and checked
 * against the volunteer's chapter role stored in JWT claims.
 */
public enum AppRole implements RouteRole {
    PUBLIC, AUTHENTICATED
}
