package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;

import io.javalin.http.Context;
import io.javalin.openapi.*;
import java.sql.SQLException;
import org.binaryheart.auth.AppRole;
import org.binaryheart.services.AssetService;

public class AssetController {

	private static final AssetService service = new AssetService();

	public static void registerRoutes() {
		get("/{id}/exists", AssetController::assetExists, AppRole.AUTHENTICATED);
	}

	@OpenApi(
		path = "/api/assets/{id}/exists",
		methods = {HttpMethod.GET},
		tags = {"Assets"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Check if an asset exists",
		description = "Returns true if an asset with the given ID exists, false otherwise.",
		pathParams = {@OpenApiParam(
			name = "id",
			description = "The unique ID of the asset to check")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Check completed successfully",
			content = {@OpenApiContent(
				from = Boolean.class)}), @OpenApiResponse(
					status = "400",
					description = "Invalid ID format"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void assetExists(Context ctx) {
		try {
			int id = Integer.parseInt(ctx.pathParam("id"));
			boolean exists = service.assetExists(id);
			ctx.status(200).json(exists);
		} catch (NumberFormatException e) {
			ctx.status(400).result("Invalid ID format");
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}
}
