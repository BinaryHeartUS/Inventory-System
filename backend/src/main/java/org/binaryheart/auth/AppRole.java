package org.binaryheart.auth;

import io.javalin.security.RouteRole;

/**
 * Defines the permission roles used by the access manager.
 *
 * <p>
 * PUBLIC - No authentication required (health checks, auth configuration).
 * AUTHENTICATED - Any account with a valid BinaryHeart access token may access.
 * CHAPTER_ADMIN - Shared or Inventory administration. INVENTORY_ADMIN -
 * Inventory Admin or National Admin; handlers enforce chapter scope. ADMIN -
 * National Admin only.
 */
public enum AppRole implements RouteRole {
	PUBLIC, AUTHENTICATED, CHAPTER_ADMIN, INVENTORY_ADMIN, ADMIN
}
