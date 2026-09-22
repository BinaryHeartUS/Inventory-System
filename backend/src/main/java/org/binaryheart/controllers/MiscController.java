package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.delete;
import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;
import static io.javalin.apibuilder.ApiBuilder.put;

import com.google.inject.Inject;
import io.javalin.http.Context;
import io.javalin.openapi.HttpMethod;
import io.javalin.openapi.OpenApi;
import io.javalin.openapi.OpenApiContent;
import io.javalin.openapi.OpenApiParam;
import io.javalin.openapi.OpenApiRequestBody;
import io.javalin.openapi.OpenApiResponse;
import io.javalin.openapi.OpenApiSecurity;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import org.binaryheart.auth.AppRole;
import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.MiscNotFoundException;
import org.binaryheart.models.ChapterRole;
import org.binaryheart.requests.InsertMiscRequest;
import org.binaryheart.responses.GetMiscResponse;
import org.binaryheart.responses.IdResponse;
import org.binaryheart.responses.MiscChangelogResponse;
import org.binaryheart.services.AuthorizationService;
import org.binaryheart.services.MiscService;
import org.binaryheart.utils.PaginationUtil;
import org.binaryheart.utils.QueryParamUtil;

public class MiscController {

	private final MiscService service;
	private final AuthorizationService authorizationService;

	@Inject
	public MiscController(MiscService service, AuthorizationService authorizationService) {
		this.service = service;
		this.authorizationService = authorizationService;
	}

	public void registerRoutes() {
		get("", this::getMiscAssets, AppRole.AUTHENTICATED);
		get("/{id}", this::getMisc, AppRole.AUTHENTICATED);
		get("/{id}/changelog", this::getMiscChangelog, AppRole.AUTHENTICATED);
		post("", this::insertMisc, AppRole.AUTHENTICATED);
		put("/{id}", this::updateMisc, AppRole.AUTHENTICATED);
		delete("/{id}", this::deleteMisc, AppRole.CHAPTER_ADMIN);
	}

	@OpenApi(
		path = "/api/misc",
		methods = {HttpMethod.GET},
		tags = {"Misc"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Retrieve misc assets donated by a party",
		queryParams = {@OpenApiParam(
			name = "donorId",
			required = true,
			type = Integer.class),
				@OpenApiParam(
					name = "pageSize",
					required = true,
					type = Integer.class),
				@OpenApiParam(
					name = "pageKey",
					required = false,
					type = Integer.class)},
		responses = {@OpenApiResponse(
			status = "200",
			content = {@OpenApiContent(
				from = GetMiscResponse[].class)}), @OpenApiResponse(
					status = "400",
					description = "Invalid donor or pagination parameters")})
	public void getMiscAssets(Context ctx) {
		try {
			Integer donorId = QueryParamUtil.intParam(ctx, "donorId");
			if (donorId == null || donorId <= 0) {
				ctx.status(400).result("A positive donorId is required");
				return;
			}
			int pageSize = PaginationUtil.parsePageSize(ctx);
			int pageKey = PaginationUtil.parsePageKey(ctx);
			List<GetMiscResponse> assets = service.getMiscAssets(donorId, pageSize, pageKey * pageSize);
			ctx.status(200).json(assets.toArray(new GetMiscResponse[0]));
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/misc/{id}",
		methods = {HttpMethod.GET},
		tags = {"Misc"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Retrieve a misc asset",
		responses = {@OpenApiResponse(
			status = "200",
			content = {@OpenApiContent(
				from = GetMiscResponse.class)}), @OpenApiResponse(
					status = "404",
					description = "Misc asset not found")})
	public void getMisc(Context ctx) {
		try {
			int id = positiveId(ctx);
			GetMiscResponse asset = service.getMisc(id);
			if (asset == null) {
				ctx.status(404).result("No misc asset with provided ID found");
			} else {
				ctx.status(200).json(asset);
			}
		} catch (IllegalArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/misc",
		methods = {HttpMethod.POST},
		tags = {"Misc"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Create a National misc asset",
		requestBody = @OpenApiRequestBody(
			required = true,
			content = {@OpenApiContent(
				from = InsertMiscRequest.class)}),
		responses = {@OpenApiResponse(
			status = "201",
			content = {@OpenApiContent(
				from = IdResponse.class)}), @OpenApiResponse(
					status = "400",
					description = "Invalid misc asset"),
				@OpenApiResponse(
					status = "403",
					description = "Inventory edit access required"),
				@OpenApiResponse(
					status = "409",
					description = "Asset ID already exists")})
	public void insertMisc(Context ctx) {
		InsertMiscRequest request = ctx.bodyAsClass(InsertMiscRequest.class);
		String error = validate(request, false);
		if (error != null) {
			ctx.status(400).result(error);
			return;
		}
		try {
			authorizationService.requireInventoryEditAccess(ctx.<List<ChapterRole>>attribute("chapterRoles"));
			int newId = service.insertMisc(request, ctx.attribute("username"));
			ctx.status(201).json(new IdResponse(newId));
		} catch (DuplicateKeyException e) {
			ctx.status(409).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/misc/{id}",
		methods = {HttpMethod.PUT},
		tags = {"Misc"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Update a misc asset",
		requestBody = @OpenApiRequestBody(
			required = true,
			content = {@OpenApiContent(
				from = InsertMiscRequest.class)}),
		responses = {@OpenApiResponse(
			status = "204",
			description = "Misc asset updated"),
				@OpenApiResponse(
					status = "400",
					description = "Invalid misc asset"),
				@OpenApiResponse(
					status = "404",
					description = "Misc asset not found")})
	public void updateMisc(Context ctx) {
		try {
			int id = positiveId(ctx);
			InsertMiscRequest body = ctx.bodyAsClass(InsertMiscRequest.class);
			InsertMiscRequest request = new InsertMiscRequest(id, body.description(), body.acquisitionDate(),
				body.value(), body.donorId());
			String error = validate(request, true);
			if (error != null) {
				ctx.status(400).result(error);
				return;
			}
			authorizationService.requireInventoryEditAccess(ctx.<List<ChapterRole>>attribute("chapterRoles"));
			service.updateMisc(request, ctx.attribute("username"));
			ctx.status(204);
		} catch (IllegalArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (MiscNotFoundException e) {
			ctx.status(404).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/misc/{id}",
		methods = {HttpMethod.DELETE},
		tags = {"Misc"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Delete a misc asset",
		responses = {@OpenApiResponse(
			status = "204",
			description = "Misc asset deleted"),
				@OpenApiResponse(
					status = "404",
					description = "Misc asset not found")})
	public void deleteMisc(Context ctx) {
		try {
			service.deleteMisc(positiveId(ctx));
			ctx.status(204);
		} catch (IllegalArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (MiscNotFoundException e) {
			ctx.status(404).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/misc/{id}/changelog",
		methods = {HttpMethod.GET},
		tags = {"Misc"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Retrieve a misc asset changelog",
		responses = {@OpenApiResponse(
			status = "200",
			content = {@OpenApiContent(
				from = MiscChangelogResponse[].class)}), @OpenApiResponse(
					status = "404",
					description = "Misc asset not found")})
	public void getMiscChangelog(Context ctx) {
		try {
			ctx.status(200).json(service.getMiscChangelog(positiveId(ctx)));
		} catch (IllegalArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (MiscNotFoundException e) {
			ctx.status(404).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	private static String validate(InsertMiscRequest request, boolean requireId) {
		if (request.description() == null || request.description().isBlank() || request.donorId() == null
			|| request.value() == null) {
			return "Description, value, and donor are required";
		}
		if (request.description().length() > 500)
			return "Description cannot exceed 500 characters";
		if (request.value() < 0)
			return "Value must be non-negative";
		if (request.donorId() <= 0)
			return "Donor ID must be positive";
		if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(LocalDate.now()))
			return "Acquisition date cannot be in the future";
		if ((requireId || request.assetId() != null) && (request.assetId() == null || request.assetId() <= 0))
			return "Asset ID must be positive";
		return null;
	}

	private static int positiveId(Context ctx) {
		try {
			int id = Integer.parseInt(ctx.pathParam("id"));
			if (id <= 0)
				throw new IllegalArgumentException("Misc asset ID must be a positive integer");
			return id;
		} catch (NumberFormatException e) {
			throw new IllegalArgumentException("Misc asset ID must be a positive integer", e);
		}
	}
}