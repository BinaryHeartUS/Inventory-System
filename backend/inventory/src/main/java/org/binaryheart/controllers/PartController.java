package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;

import java.sql.SQLException;

import org.binaryheart.auth.AppRole;
import org.binaryheart.responses.PartResponse;
import org.binaryheart.services.PartService;

import io.javalin.http.Context;
import io.javalin.openapi.*;

public class PartController {

    private static final PartService service = new PartService();

    public static void registerRoutes() {
        get("/parts", PartController::getAllParts, AppRole.AUTHENTICATED);
    }

    @OpenApi(
            path = "/api/assets/parts",
            methods = { HttpMethod.GET },
            tags = { "Parts" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Get a list of all parts currently in inventory",
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Parts fetched successfully",
                    content = { @OpenApiContent(
                            from = PartResponse[].class) }),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void getAllParts(Context ctx) {
        try {
            PartResponse[] res = service.getAllParts();
            ctx.status(200).json(res);
        } catch (SQLException e) {
            ctx.status(500).result("Datbase error: ".concat(e.getMessage()));
            return;
        }
    }
}
