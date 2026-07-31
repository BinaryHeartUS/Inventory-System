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
import org.binaryheart.exceptions.ToolNotFoundException;
import org.binaryheart.requests.ToolListRequest;
import org.binaryheart.requests.InsertToolRequest;
import org.binaryheart.responses.GetToolResponse;
import org.binaryheart.responses.IdResponse;
import org.binaryheart.responses.ToolChangelogResponse;
import org.binaryheart.services.AuthorizationService;
import org.binaryheart.services.ToolService;
import org.binaryheart.utils.PaginationUtil;
import org.binaryheart.utils.QueryParamUtil;

public class ToolController {

	private final ToolService service;
	private final AuthorizationService authorizationService;

	@Inject
	public ToolController(ToolService service, AuthorizationService authorizationService) {
		this.service = service;
		this.authorizationService = authorizationService;
	}

	public void registerRoutes() {
		get("", this::getAllTools, AppRole.AUTHENTICATED);
		get("/{id}", this::getTool, AppRole.AUTHENTICATED);
		get("/{id}/changelog", this::getToolChangelog, AppRole.AUTHENTICATED);
		post("", this::insertTool, AppRole.AUTHENTICATED);
		put("/{id}", this::updateTool, AppRole.AUTHENTICATED);
		delete("/{id}", this::deleteTool, AppRole.CHAPTER_ADMIN);
	}

	@OpenApi(
		path = "/api/tools",
		methods = {HttpMethod.GET},
		tags = {"Tools"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Retrieve a page of tools",
		description = "Returns a filtered, paginated page of tools the user can access, ordered by id. "
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
					description = "Free-text search matched against every tool field (id, description, etc.)."),
				@OpenApiParam(
					name = "chapter",
					required = false,
					type = Integer.class,
					description = "Restrict to a single chapter id (must be within the user's access)."),
				@OpenApiParam(
					name = "donorId",
					required = false,
					type = Integer.class,
					description = "Restrict to tools donated by this party id.")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Tools received successfully",
			content = {@OpenApiContent(
				from = GetToolResponse[].class)}), @OpenApiResponse(
					status = "400",
					description = "Missing/invalid pagination or filter parameters"),
				@OpenApiResponse(
					status = "403",
					description = "Access denied for the requested chapter"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public void getAllTools(Context ctx) {
		try {
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			int pageSize = PaginationUtil.parsePageSize(ctx);
			int pageKey = PaginationUtil.parsePageKey(ctx);
			Integer chapterId = QueryParamUtil.intParam(ctx, "chapter");
			ToolListRequest q = new ToolListRequest(QueryParamUtil.stringParam(ctx, "search"),
				QueryParamUtil.intParam(ctx, "donorId"), pageSize, pageKey * pageSize);
			List<GetToolResponse> tools = service.getTools(userChapterIds, chapterId, q);
			ctx.status(200).json(tools.toArray(new GetToolResponse[0]));
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (ForbiddenException e) {
			ctx.status(403).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/tools/{id}",
		methods = {HttpMethod.GET},
		tags = {"Tools"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Retrieve a specific tool",
		description = "Returns a tool with specified ID",
		pathParams = {@OpenApiParam(
			name = "id",
			description = "Tool ID: A unique number assigned to each tool")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Tool retrieved successfully",
			content = {@OpenApiContent(
				from = GetToolResponse.class)}), @OpenApiResponse(
					status = "400",
					description = "Non-numeric or non-positive tool ID"),
				@OpenApiResponse(
					status = "404",
					description = "ID does not match any existing tools"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public void getTool(Context ctx) {
		try {
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			int toolId = Integer.parseInt(ctx.pathParam("id"));
			if (toolId <= 0) {
				ctx.status(400).result("Tool ID must be a positive integer");
				return;
			}
			GetToolResponse tool = service.getTool(userChapterIds, toolId);

			if (tool == null) {
				ctx.status(404).result("No tool with provided ID found");
			} else {
				ctx.status(200).json(tool);
			}
		} catch (NumberFormatException e) {
			ctx.status(400).result("Tool ID was not an integer");
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/tools",
		methods = {HttpMethod.POST},
		tags = {"Tools"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Add a new tool to the database",
		description = "Adds a tool with the specified attributes",
		requestBody = @OpenApiRequestBody(
			required = true,
			content = {@OpenApiContent(
				from = InsertToolRequest.class,
				example = """
					{
					  "chapterId": 1,
					  "assetId": null,
					  "description": null,
					  "acquisitionDate": null,
					  "value": null,
					  "donorId": null
					}""")}),
		responses = {@OpenApiResponse(
			status = "201",
			description = "Tool added successfully; returns the new asset id",
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
	public void insertTool(Context ctx) {
		InsertToolRequest request = ctx.bodyAsClass(InsertToolRequest.class);
		if (request.chapterId() == 0 || request.description() == null) {
			ctx.status(400).result("Missing required parameters");
			return;
		}
		if (request.description().isEmpty()) {
			ctx.status(400).result("Description cannot be empty string");
			return;
		}
		if (request.value() != null && request.value() < 0) {
			ctx.status(400).result("Value must be non-negative or not specified");
			return;
		}
		if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
			ctx.status(400).result("Acquisition date cannot be in the future");
			return;
		}
		if (request.assetId() != null && request.assetId() <= 0) {
			ctx.status(400).result("Asset ID must be positive or not specified");
			return;
		}

		try {
			authorizationService.requireChapterEditAccess(ctx, request.chapterId());
			int newId = service.insertTool(request, ctx.attribute("username"));
			ctx.status(201).json(new IdResponse(newId));
		} catch (DuplicateKeyException e) {
			ctx.status(409).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/tools/{id}",
		methods = {HttpMethod.DELETE},
		tags = {"Tools"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Delete a tool currently in inventory",
		pathParams = {@OpenApiParam(
			name = "id",
			required = true,
			description = "Tool ID to delete")},
		responses = {@OpenApiResponse(
			status = "204",
			description = "Tool deleted successfully",
			content = {@OpenApiContent(
				from = GetToolResponse.class)}), @OpenApiResponse(
					status = "400",
					description = "Non-positive or non-numeric ID provided"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public void deleteTool(Context ctx) {
		try {
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			int toolId = Integer.parseInt(ctx.pathParam("id"));
			if (toolId <= 0) {
				ctx.status(400).result("Tool ID must be a positive integer");
				return;
			}
			service.deleteTool(userChapterIds, toolId);
			ctx.status(204).result("Tool deleted successfully");
		} catch (NumberFormatException e) {
			ctx.status(400).result("Tool ID must be a positive integer");
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/tools/{id}",
		methods = {HttpMethod.PUT},
		tags = {"Tools"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Updates a tool in the database",
		description = "Updates a tool with the specified ID and attributes",
		pathParams = {@OpenApiParam(
			name = "id",
			description = "The asset ID of the tool to update")},
		requestBody = @OpenApiRequestBody(
			required = true,
			content = {@OpenApiContent(
				from = InsertToolRequest.class,
				example = """
					{
					  "chapterId": 1,
					  "assetId": null,
					  "description": null,
					  "acquisitionDate": null,
					  "value": null,
					  "donorId": null
					}""")}),
		responses = {@OpenApiResponse(
			status = "201",
			description = "Tool updated successfully"),
				@OpenApiResponse(
					status = "400",
					description = "Missing required parameters or invalid field values"),
				@OpenApiResponse(
					status = "401",
					description = "Tool with specified ID does not exist"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public void updateTool(Context ctx) {
		InsertToolRequest request = ctx.bodyAsClass(InsertToolRequest.class);
		if (request.chapterId() == 0 || request.description() == null) {
			ctx.status(400).result("Missing required parameters");
			return;
		}
		if (request.description().isEmpty()) {
			ctx.status(400).result("Description cannot be empty string");
			return;
		}
		if (request.value() != null && request.value() < 0) {
			ctx.status(400).result("Value must be non-negative or not specified");
			return;
		}
		if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
			ctx.status(400).result("Acquisition date cannot be in the future");
			return;
		}
		if (request.assetId() != null && request.assetId() <= 0) {
			ctx.status(400).result("Asset ID must be positive or not specified");
			return;
		}

		try {
			authorizationService.requireChapterEditAccess(ctx, request.chapterId());
			service.updateTool(request, ctx.attribute("username"));
			ctx.status(201).result("Tool updated successfully");
		} catch (ToolNotFoundException e) {
			ctx.status(404).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/tools/{id}/changelog",
		methods = {HttpMethod.GET},
		tags = {"Tools"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Get the changelog for a tool",
		pathParams = {@OpenApiParam(
			name = "id",
			required = true,
			description = "Tool ID to retrieve changelog for")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Changelog fetched successfully",
			content = {@OpenApiContent(
				from = ToolChangelogResponse[].class)}), @OpenApiResponse(
					status = "400",
					description = "Non-positive or non-numeric ID provided"),
				@OpenApiResponse(
					status = "404",
					description = "Tool not found"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public void getToolChangelog(Context ctx) {
		try {
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			int toolId = Integer.parseInt(ctx.pathParam("id"));
			if (toolId <= 0) {
				ctx.status(400).result("Tool ID must be a positive integer");
				return;
			}
			ToolChangelogResponse[] changelog = service.getToolChangelog(userChapterIds, toolId);
			ctx.status(200).json(changelog);
		} catch (NumberFormatException e) {
			ctx.status(400).result("Tool ID must be a positive integer");
		} catch (InvalidParameterException e) {
			ctx.status(404).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}
}
