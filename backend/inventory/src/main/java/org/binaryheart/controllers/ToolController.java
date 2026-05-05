package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;

import java.sql.SQLException;
import java.util.List;

import org.binaryheart.auth.AppRole;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.responses.GetToolResponse;
import org.binaryheart.services.ToolService;

import static io.javalin.apibuilder.ApiBuilder.get;

public class ToolController {

    private static final ToolService service = new ToolService();

    public static void registerRoutes() {
        get("", ToolController::getAllTools, AppRole.AUTHENTICATED);
        get("/{id}", ToolController::getTool, AppRole.AUTHENTICATED);
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
}
