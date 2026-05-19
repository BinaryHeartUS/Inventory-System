package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;

import java.security.InvalidParameterException;
import java.sql.SQLException;
import java.util.List;

import org.binaryheart.auth.AppRole;
import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.exceptions.ToolNotFoundException;
import org.binaryheart.requests.InsertToolRequest;
import org.binaryheart.responses.GetToolResponse;
import org.binaryheart.responses.ToolChangelogResponse;
import org.binaryheart.services.ToolService;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;
import static io.javalin.apibuilder.ApiBuilder.put;
import static io.javalin.apibuilder.ApiBuilder.delete;

public class ToolController {

    private static final ToolService service = new ToolService();

    public static void registerRoutes() {
        get("", ToolController::getAllTools, AppRole.AUTHENTICATED);
        get("/{id}", ToolController::getTool, AppRole.AUTHENTICATED);
        get("/{id}/changelog", ToolController::getToolChangelog, AppRole.AUTHENTICATED);
        post("", ToolController::insertTool, AppRole.AUTHENTICATED);
        put("/{id}", ToolController::updateTool, AppRole.AUTHENTICATED);
        delete("/{id}", ToolController::deleteTool, AppRole.CHAPTER_ADMIN);
    }

    @OpenApi(
            path = "/api/tools",
            methods = { HttpMethod.GET },
            tags = { "Tools" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Retrieve all tools",
            description = "Returns a list of all devices.",
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Tools received successfully",
                    content = { @OpenApiContent(
                            from = GetToolResponse[].class) }),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void getAllTools(Context ctx) {
        try {
            List<Integer> userChapterIds = ctx.attribute("chapterIds");
            List<GetToolResponse> tools = service.getAllTools(userChapterIds);
            ctx.status(200).json(tools.toArray(new GetToolResponse[0]));
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }

    @OpenApi(
            path = "/api/tools/{id}",
            methods = { HttpMethod.GET },
            tags = { "Tools" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Retrieve a specific tool",
            description = "Returns a tool with specified ID",
            pathParams = { @OpenApiParam(
                    name = "id",
                    description = "Tool ID: A unique number assigned to each tool") },
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Tool retrieved successfully",
                    content = { @OpenApiContent(
                            from = GetToolResponse.class) }),
                    @OpenApiResponse(
                            status = "400",
                            description = "Non-numeric or non-positive tool ID"),
                    @OpenApiResponse(
                            status = "404",
                            description = "ID does not match any existing tools"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void getTool(Context ctx) {
        try {
            List<Integer> userChapterIds = ctx.attribute("chapterIds");
            GetToolResponse tool = service.getTool(userChapterIds, Integer.parseInt(ctx.pathParam("id")));

            if (tool == null) {
                ctx.status(404).result("No tool with provided ID found");
            } else {
                ctx.status(200).json(tool);
            }
        } catch (NumberFormatException e) {
            ctx.status(400).result("Tool ID was not an integer");
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
            return;
        } catch (MissingRequiredParametersException e) {
            ctx.status(400).result("Tool ID must be a positive integer");
        }
    }

    @OpenApi(
            path = "/api/tools",
            methods = { HttpMethod.POST },
            tags = { "Tools" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Add a new tool to the database",
            description = "Adds a tool with the specified attributes",
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = InsertToolRequest.class,
                            example = """
                                    {
                                      "chapterId": 1,
                                      "assetId": null,
                                      "description": null,
                                      "acquisitionDate": null,
                                      "value": null,
                                      "donorId": null
                                    }""") }),
            responses = { @OpenApiResponse(
                    status = "201",
                    description = "Tool added successfully"),
                    @OpenApiResponse(
                            status = "400",
                            description = "Missing required parameters or invalid field values"),
                    @OpenApiResponse(
                            status = "409",
                            description = "Asset ID already exists"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void insertTool(Context ctx) {
        InsertToolRequest request = ctx.bodyAsClass(InsertToolRequest.class);

        try {
            AuthController.requireChapterEditAccess(ctx, request.chapterId());
            service.insertTool(request, ctx.attribute("username"));
            ctx.status(201).result("Tool added successfully");
        } catch (MissingRequiredParametersException | BadArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (DuplicateKeyException e) {
            ctx.status(409).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }

    @OpenApi(
            path = "/api/tools/{id}",
            methods = { HttpMethod.DELETE },
            tags = { "Tools" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Delete a tool currently in inventory",
            pathParams = { @OpenApiParam(
                    name = "id",
                    required = true,
                    description = "Tool ID to delete") },
            responses = { @OpenApiResponse(
                    status = "204",
                    description = "Tool deleted successfully",
                    content = { @OpenApiContent(
                            from = GetToolResponse.class) }),
                    @OpenApiResponse(
                            status = "400",
                            description = "Non-positive or non-numeric ID provided"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void deleteTool(Context ctx) {
        try {
            List<Integer> userChapterIds = ctx.attribute("chapterIds");
            service.deleteTool(userChapterIds, Integer.parseInt(ctx.pathParam("id")));
            ctx.status(204).result("Tool deleted successfully");
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        } catch (BadArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (ToolNotFoundException e) {
            ctx.status(404).result(e.getMessage());
        }
    }

    @OpenApi(
            path = "/api/tools/{id}",
            methods = { HttpMethod.PUT },
            tags = { "Tools" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Updates a tool in the database",
            description = "Updates a tool with the specified ID and attributes",
            pathParams = { @OpenApiParam(
                    name = "id",
                    description = "The asset ID of the tool to update") },
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = InsertToolRequest.class,
                            example = """
                                    {
                                      "chapterId": 1,
                                      "assetId": null,
                                      "description": null,
                                      "acquisitionDate": null,
                                      "value": null,
                                      "donorId": null
                                    }""") }),
            responses = { @OpenApiResponse(
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
                            description = "Database error") })
    public static void updateTool(Context ctx) {
        InsertToolRequest request = ctx.bodyAsClass(InsertToolRequest.class);

        try {
            AuthController.requireChapterEditAccess(ctx, request.chapterId());
            service.updateTool(request, ctx.attribute("username"));
            ctx.status(201).result("Tool updated successfully");
        } catch (MissingRequiredParametersException | BadArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (ToolNotFoundException e) {
            ctx.status(404).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }

    @OpenApi(
            path = "/api/tools/{id}/changelog",
            methods = { HttpMethod.GET },
            tags = { "Tools" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Get the changelog for a tool",
            pathParams = { @OpenApiParam(
                    name = "id",
                    required = true,
                    description = "Tool ID to retrieve changelog for") },
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Changelog fetched successfully",
                    content = { @OpenApiContent(
                            from = ToolChangelogResponse[].class) }),
                    @OpenApiResponse(
                            status = "400",
                            description = "Non-positive or non-numeric ID provided"),
                    @OpenApiResponse(
                            status = "404",
                            description = "Tool not found"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void getToolChangelog(Context ctx) {
        try {
            List<Integer> userChapterIds = ctx.attribute("chapterIds");
            int toolId = Integer.parseInt(ctx.pathParam("id"));
            ToolChangelogResponse[] changelog = service.getToolChangelog(userChapterIds, toolId);
            ctx.status(200).json(changelog);
        } catch (NumberFormatException e) {
            ctx.status(400).result("Tool ID must be a positive integer");
        } catch (MissingRequiredParametersException e) {
            ctx.status(400).result(e.getMessage());
        } catch (InvalidParameterException e) {
            ctx.status(404).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }

}
