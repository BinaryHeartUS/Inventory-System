package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;
import org.binaryheart.auth.AppRole;
import org.binaryheart.responses.LookupResponse;
import org.binaryheart.services.LookupService;

import java.sql.SQLException;

import static io.javalin.apibuilder.ApiBuilder.get;

public class LookupController {

    private static final LookupService service = new LookupService();

    public static void registerRoutes() {
        get("", LookupController::getAll, AppRole.AUTHENTICATED);
    }

    @OpenApi(
            path = "/api/lookup",
            methods = { HttpMethod.GET },
            tags = { "Lookup" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Retrieve all lookup option lists",
            description = "Returns all dropdown/combo option lists in a single request.",
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Lookup data",
                    content = { @OpenApiContent(
                            from = LookupResponse.class) }),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void getAll(Context ctx) {
        try {
            LookupResponse response = service.getAll();
            ctx.json(response);
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }
}
