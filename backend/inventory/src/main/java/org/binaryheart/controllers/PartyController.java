package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;
import static io.javalin.apibuilder.ApiBuilder.put;

import java.sql.SQLException;
import java.util.List;

import org.binaryheart.auth.AppRole;
import org.binaryheart.responses.GetPartyResponse;
import org.binaryheart.services.PartyService;

import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import io.javalin.openapi.HttpMethod;
import io.javalin.openapi.OpenApi;
import io.javalin.openapi.OpenApiContent;
import io.javalin.openapi.OpenApiParam;
import io.javalin.openapi.OpenApiRequestBody;
import io.javalin.openapi.OpenApiResponse;
import io.javalin.openapi.OpenApiSecurity;

public class PartyController {

    private static final PartyService service = new PartyService();

    public static void registerRoutes() {
        get("", PartyController::getAllParties, AppRole.AUTHENTICATED);
        get("/{id}", PartyController::getParty, AppRole.AUTHENTICATED);
    }

    @OpenApi(
            path = "/api/party",
            methods = { HttpMethod.GET },
            tags = { "Party" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Retrieve all parties",
            description = "Returns a list of all parties.",
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Parties retrieved successfully",
                    content = { @OpenApiContent(
                            from = GetPartyResponse[].class) }),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void getAllParties(Context ctx) {
        try {
            List<GetPartyResponse> parties = service.getAllParties(); 
            ctx.status(200).json(parties.toArray(new GetPartyResponse[0]));
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }

    public static void getParty(Context ctx) {

    }
}
