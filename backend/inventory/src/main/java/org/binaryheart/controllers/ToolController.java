package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;

import java.sql.SQLException;
import java.util.List;

import org.binaryheart.auth.AppRole;
import org.binaryheart.responses.GetToolResponse;
import org.binaryheart.services.ToolService;

import static io.javalin.apibuilder.ApiBuilder.get;

public class ToolController {

    private static final ToolService service = new ToolService();

    public static void registerRoutes() {
        get("", ToolController::getAllTools, AppRole.AUTHENTICATED);
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
}
