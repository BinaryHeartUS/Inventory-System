package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;

import com.google.inject.Inject;
import io.javalin.http.Context;
import io.javalin.openapi.*;
import java.sql.SQLException;
import org.binaryheart.auth.AppRole;
import org.binaryheart.responses.AssetTypeResponse;
import org.binaryheart.services.AssetService;

public class AssetController {

	private final AssetService service;

	@Inject
	public AssetController(AssetService service) {
		this.service = service;
	}

	public void registerRoutes() {
		get("/{id}/exists", this::assetExists, AppRole.AUTHENTICATED);
		get("/{id}/type", this::getAssetType, AppRole.AUTHENTICATED);
	}

	@OpenApi(
		path = "/api/assets/{id}/type",
		methods = {HttpMethod.GET},
		tags = {"Assets"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Resolve an asset ID to its asset type",
		responses = {@OpenApiResponse(
			status = "200",
			content = {@OpenApiContent(
				from = AssetTypeResponse.class)}), @OpenApiResponse(
					status = "404",
					description = "Asset not found")})
	public void getAssetType(Context ctx) {
		try {
			int id = Integer.parseInt(ctx.pathParam("id"));
			if (id <= 0) {
				ctx.status(400).result("Asset ID must be a positive integer");
				return;
			}
			String type = service.getAssetType(id);
			if (type == null) {
				ctx.status(404).result("Asset not found");
			} else {
				ctx.status(200).json(new AssetTypeResponse(type));
			}
		} catch (NumberFormatException e) {
			ctx.status(400).result("Asset ID must be a positive integer");
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
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
	public void assetExists(Context ctx) {
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
