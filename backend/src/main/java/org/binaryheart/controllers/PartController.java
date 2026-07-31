package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.delete;
import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;
import static io.javalin.apibuilder.ApiBuilder.put;

import com.google.inject.Inject;
import io.javalin.http.Context;
import io.javalin.openapi.*;
import java.security.InvalidParameterException;
import java.sql.SQLException;
import java.util.List;
import org.binaryheart.auth.AppRole;
import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.ForbiddenException;
import org.binaryheart.exceptions.PartNotFoundException;
import org.binaryheart.requests.PartListRequest;
import org.binaryheart.requests.InsertPartRequest;
import org.binaryheart.responses.IdResponse;
import org.binaryheart.responses.PartChangelogResponse;
import org.binaryheart.responses.PartResponse;
import org.binaryheart.responses.PartTypeCountResponse;
import org.binaryheart.services.AuthorizationService;
import org.binaryheart.services.PartService;
import org.binaryheart.utils.PaginationUtil;
import org.binaryheart.utils.QueryParamUtil;

public class PartController {

	private final PartService service;
	private final AuthorizationService authorizationService;

	@Inject
	public PartController(PartService service, AuthorizationService authorizationService) {
		this.service = service;
		this.authorizationService = authorizationService;
	}

	public void registerRoutes() {
		get("", this::getAllParts, AppRole.AUTHENTICATED);
		get("/type-counts", this::getPartTypeCounts, AppRole.AUTHENTICATED);
		get("/device/{deviceId}", this::getPartsByDevice, AppRole.AUTHENTICATED);
		get("/{id}", this::getPart, AppRole.AUTHENTICATED);
		get("/{id}/changelog", this::getPartChangelog, AppRole.AUTHENTICATED);
		delete("/{id}", this::deletePart, AppRole.CHAPTER_ADMIN);
		put("/{id}", this::updatePart, AppRole.AUTHENTICATED);
		post("", this::insertPart, AppRole.AUTHENTICATED);
	}

	@OpenApi(
		path = "/api/parts",
		methods = {HttpMethod.GET},
		tags = {"Parts"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Get a page of parts currently in inventory",
		description = "Returns a filtered, paginated page of parts the user can access, ordered by type then id. "
			+ "pageSize is required.",
		queryParams = {@OpenApiParam(
			name = "pageSize",
			required = true,
			type = Integer.class,
			description = "Number of records per page (1-1000). Required."),
				@OpenApiParam(
					name = "pageKey",
					required = false,
					type = Integer.class,
					description = "Zero-based page index. Defaults to 0."),
				@OpenApiParam(
					name = "search",
					required = false,
					description = "Free-text search matched against every part field (id, type, description, etc.)."),
				@OpenApiParam(
					name = "type",
					required = false,
					description = "Filter by part type."),
				@OpenApiParam(
					name = "source",
					required = false,
					description = "Filter by source: 'donated' or 'purchased'."),
				@OpenApiParam(
					name = "includeInDevice",
					required = false,
					type = Boolean.class,
					description = "Whether to include parts already contained in a device. Defaults to true."),
				@OpenApiParam(
					name = "chapter",
					required = false,
					type = Integer.class,
					description = "Restrict to a single chapter id (must be within the user's access)."),
				@OpenApiParam(
					name = "donorId",
					required = false,
					type = Integer.class,
					description = "Restrict to parts donated by this party id.")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Parts fetched successfully",
			content = {@OpenApiContent(
				from = PartResponse[].class)}), @OpenApiResponse(
					status = "400",
					description = "Missing/invalid pagination or filter parameters"),
				@OpenApiResponse(
					status = "403",
					description = "Access denied for the requested chapter"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public void getAllParts(Context ctx) {
		try {
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			int pageSize = PaginationUtil.parsePageSize(ctx);
			int pageKey = PaginationUtil.parsePageKey(ctx);
			Integer chapterId = QueryParamUtil.intParam(ctx, "chapter");
			PartListRequest q = new PartListRequest(QueryParamUtil.stringParam(ctx, "search"),
				QueryParamUtil.stringParam(ctx, "type"), QueryParamUtil.stringParam(ctx, "source"),
				QueryParamUtil.boolParam(ctx, "includeInDevice", true), QueryParamUtil.intParam(ctx, "donorId"),
				pageSize, pageKey * pageSize);
			PartResponse[] res = service.getParts(userChapterIds, chapterId, q);
			ctx.status(200).json(res);
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (ForbiddenException e) {
			ctx.status(403).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: ".concat(e.getMessage()));
			return;
		}
	}

	@OpenApi(
		path = "/api/parts/type-counts",
		methods = {HttpMethod.GET},
		tags = {"Parts"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Get the total part count per type",
		description = "Returns the number of parts of each type matching the given filters (unpaginated). "
			+ "Accepts the same filter parameters as the parts list, so the grouped UI can show accurate "
			+ "group totals while rows stream in.",
		queryParams = {@OpenApiParam(
			name = "search",
			required = false,
			description = "Free-text search matched against every part field."),
				@OpenApiParam(
					name = "type",
					required = false,
					description = "Filter by part type."),
				@OpenApiParam(
					name = "source",
					required = false,
					description = "Filter by source: 'donated' or 'purchased'."),
				@OpenApiParam(
					name = "includeInDevice",
					required = false,
					type = Boolean.class,
					description = "Whether to include parts already contained in a device. Defaults to true."),
				@OpenApiParam(
					name = "chapter",
					required = false,
					type = Integer.class,
					description = "Restrict to a single chapter id (must be within the user's access)."),
				@OpenApiParam(
					name = "donorId",
					required = false,
					type = Integer.class,
					description = "Restrict to parts donated by this party id.")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Per-type counts fetched successfully",
			content = {@OpenApiContent(
				from = PartTypeCountResponse[].class)}), @OpenApiResponse(
					status = "400",
					description = "Invalid filter parameters"),
				@OpenApiResponse(
					status = "403",
					description = "Access denied for the requested chapter"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public void getPartTypeCounts(Context ctx) {
		try {
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			Integer chapterId = QueryParamUtil.intParam(ctx, "chapter");
			PartListRequest q = new PartListRequest(QueryParamUtil.stringParam(ctx, "search"),
				QueryParamUtil.stringParam(ctx, "type"), QueryParamUtil.stringParam(ctx, "source"),
				QueryParamUtil.boolParam(ctx, "includeInDevice", true), QueryParamUtil.intParam(ctx, "donorId"), null,
				null);
			ctx.status(200).json(service.getPartTypeCounts(userChapterIds, chapterId, q));
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (ForbiddenException e) {
			ctx.status(403).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Datbase error: ".concat(e.getMessage()));
		}
	}

	@OpenApi(
		path = "/api/parts/{id}",
		methods = {HttpMethod.GET},
		tags = {"Parts"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Get information regarding a part currently in inventory",
		pathParams = {@OpenApiParam(
			name = "id",
			required = true,
			description = "Part ID whose information to retrieve")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Parts fetched successfully",
			content = {@OpenApiContent(
				from = PartResponse.class)}), @OpenApiResponse(
					status = "400",
					description = "Non-positive or non-numeric ID provided"),
				@OpenApiResponse(
					status = "404",
					description = "No part with provided ID found"),
				@OpenApiResponse(
					status = "500",
					description = "Database error"),})
	public void getPart(Context ctx) {
		try {
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			int partId = Integer.parseInt(ctx.pathParam("id"));
			if (partId <= 0) {
				ctx.status(400).result("Part ID must be positive integer; was non-numeric or non-positive");
				return;
			}
			PartResponse res = service.getPart(userChapterIds, partId);

			if (res == null) {
				ctx.status(404).result("No part with provided ID found");
			} else {
				ctx.status(200).json(res);
			}
		} catch (NumberFormatException e) {
			ctx.status(400).result("Part ID must be positive integer; was non-numeric or non-positive");
		} catch (SQLException e) {
			ctx.status(500).result("Datbase error: ".concat(e.getMessage()));
		}
	}

	@OpenApi(
		path = "/api/parts/{id}",
		methods = {HttpMethod.DELETE},
		tags = {"Parts"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Delete a part currently in inventory",
		pathParams = {@OpenApiParam(
			name = "id",
			required = true,
			description = "Part ID to delete")},
		responses = {@OpenApiResponse(
			status = "204",
			description = "Part deleted",
			content = {@OpenApiContent(
				from = PartResponse.class)}), @OpenApiResponse(
					status = "400",
					description = "Non-positive or non-numeric ID provided"),
				@OpenApiResponse(
					status = "500",
					description = "Database error"),})
	public void deletePart(Context ctx) {
		try {
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			int partId = Integer.parseInt(ctx.pathParam("id"));
			if (partId <= 0) {
				ctx.status(400).result("Part ID must be a positive integer");
				return;
			}
			service.deletePart(userChapterIds, partId, ctx.attribute("username"));
			ctx.status(204);
		} catch (NumberFormatException e) {
			ctx.status(400).result("Part ID must be a positive integer");
		} catch (SQLException e) {
			ctx.status(500).result("Datbase error: ".concat(e.getMessage()));
		} catch (InvalidParameterException e) {
			ctx.status(400).result(e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/parts/{id}",
		methods = {HttpMethod.PUT},
		tags = {"Parts"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Update a part currently in inventory",
		pathParams = {@OpenApiParam(
			name = "id",
			required = true,
			description = "Part ID to update")},
		requestBody = @OpenApiRequestBody(
			required = true,
			content = {@OpenApiContent(
				from = InsertPartRequest.class,
				example = """
					{
					    "chapterId": 1,
					    "type": "SATA SSD",
					    "description": "256 GB SSD",
					    "wasPurchased": true,
					    "containedIn": null,
					    "id": null,
					    "acquisitionDate": null,
					    "value": 0.00,
					    "donorId": null
					}""")}),
		responses = {@OpenApiResponse(
			status = "201",
			description = "Part updated successfully",
			content = {@OpenApiContent(
				from = PartResponse.class)}), @OpenApiResponse(
					status = "400",
					description = "Missing required parameters or invalid parameter"),
				@OpenApiResponse(
					status = "401",
					description = "Part with specified ID does not exist"),
				@OpenApiResponse(
					status = "500",
					description = "Database error"),})
	public void updatePart(Context ctx) {
		InsertPartRequest request = ctx.bodyAsClass(InsertPartRequest.class);
		if (request.chapterId() == 0 || request.type() == null || request.type().isEmpty()
			|| request.wasPurchased() == null || request.description() == null || request.description().isEmpty()) {
			ctx.status(400).result("Missing required parameters");
			return;
		}
		if (request.containedIn() != null && request.containedIn() <= 0) {
			ctx.status(400).result("Contained In ID must be positive or not specified");
			return;
		}
		if (request.id() != null && request.id() <= 0) {
			ctx.status(400).result("Asset ID must be positive or not specified");
			return;
		}
		if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
			ctx.status(400).result("Acquisition date cannot be in the future");
			return;
		}
		if (request.value() != null && request.value() < 0) {
			ctx.status(400).result("Value must be non-negative or not specified");
			return;
		}
		if (request.donorId() != null && request.donorId() <= 0) {
			ctx.status(400).result("Donor ID must be positive or not specified");
			return;
		}

		try {
			authorizationService.requireChapterEditAccess(ctx, request.chapterId());
			service.updatePart(request, ctx.attribute("username"));
			ctx.status(201).result("Part updated successfully");
		} catch (PartNotFoundException e) {
			ctx.status(401).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/parts/device/{deviceId}",
		methods = {HttpMethod.GET},
		tags = {"Parts"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Get all parts linked to a specific device",
		pathParams = {@OpenApiParam(
			name = "deviceId",
			required = true,
			description = "Device ID whose linked parts to retrieve")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Parts fetched successfully",
			content = {@OpenApiContent(
				from = PartResponse[].class)}), @OpenApiResponse(
					status = "400",
					description = "Non-positive or non-numeric device ID"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public void getPartsByDevice(Context ctx) {
		try {
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			int deviceId = Integer.parseInt(ctx.pathParam("deviceId"));
			if (deviceId <= 0) {
				ctx.status(400).result("Device ID must be a positive integer");
				return;
			}
			PartResponse[] res = service.getPartsByDevice(userChapterIds, deviceId);
			ctx.status(200).json(res);
		} catch (NumberFormatException e) {
			ctx.status(400).result("Device ID must be a positive integer");
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/parts",
		methods = {HttpMethod.POST},
		tags = {"Parts"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Add a new part to the database",
		description = "Adds a new part with the specified attributes",
		requestBody = @OpenApiRequestBody(
			required = true,
			content = {@OpenApiContent(
				from = InsertPartRequest.class,
				example = """
					{
					    "chapterId": 1,
					    "type": "SATA SSD",
					    "description": "256 GB SSD",
					    "wasPurchased": true,
					    "containedIn": null,
					    "id": null,
					    "acquisitionDate": null,
					    "value": 0.00,
					    "donorId": null
					}""")}),
		responses = {@OpenApiResponse(
			status = "201",
			description = "Part added successfully; returns the new asset id",
			content = {@OpenApiContent(
				from = IdResponse.class)}), @OpenApiResponse(
					status = "400",
					description = "Missing required parameters or invalid field values"),
				@OpenApiResponse(
					status = "409",
					description = "Asset ID already exists"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public void insertPart(Context ctx) {
		InsertPartRequest request = ctx.bodyAsClass(InsertPartRequest.class);
		if (request.chapterId() == 0 || request.type() == null || request.type().isEmpty()
			|| request.wasPurchased() == null || request.description() == null || request.description().isEmpty()) {
			ctx.status(400).result("Missing required parameters");
			return;
		}
		if (request.containedIn() != null && request.containedIn() <= 0) {
			ctx.status(400).result("Contained In ID must be positive or not specified");
			return;
		}
		if (request.id() != null && request.id() <= 0) {
			ctx.status(400).result("Asset ID must be positive or not specified");
			return;
		}
		if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
			ctx.status(400).result("Acquisition date cannot be in the future");
			return;
		}
		if (request.value() != null && request.value() < 0) {
			ctx.status(400).result("Value must be non-negative or not specified");
			return;
		}
		if (request.donorId() != null && request.donorId() <= 0) {
			ctx.status(400).result("Donor ID must be positive or not specified");
			return;
		}

		try {
			authorizationService.requireChapterEditAccess(ctx, request.chapterId());
			int newId = service.insertPart(request, ctx.attribute("username"));
			ctx.status(201).json(new IdResponse(newId));
		} catch (DuplicateKeyException e) {
			ctx.status(409).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/parts/{id}/changelog",
		methods = {HttpMethod.GET},
		tags = {"Parts"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Get the service history for a part",
		pathParams = {@OpenApiParam(
			name = "id",
			required = true,
			description = "Part ID to retrieve changelog for")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Changelog fetched successfully",
			content = {@OpenApiContent(
				from = PartChangelogResponse[].class)}), @OpenApiResponse(
					status = "400",
					description = "Non-positive or non-numeric ID provided"),
				@OpenApiResponse(
					status = "404",
					description = "Part not found"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public void getPartChangelog(Context ctx) {
		try {
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			int partId = Integer.parseInt(ctx.pathParam("id"));
			if (partId <= 0) {
				ctx.status(400).result("Part ID must be a positive integer");
				return;
			}
			PartChangelogResponse[] changelog = service.getPartChangelog(userChapterIds, partId);
			ctx.status(200).json(changelog);
		} catch (NumberFormatException e) {
			ctx.status(400).result("Part ID must be a positive integer");
		} catch (InvalidParameterException e) {
			ctx.status(404).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}
}
