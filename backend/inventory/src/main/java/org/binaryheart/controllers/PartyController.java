package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;

import java.sql.SQLException;
import java.util.List;

import org.binaryheart.auth.AppRole;
import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.PartyNotFoundException;
import org.binaryheart.responses.GetPartyResponse;
import org.binaryheart.services.PartyService;

import io.javalin.http.Context;
import io.javalin.openapi.HttpMethod;
import io.javalin.openapi.OpenApi;
import io.javalin.openapi.OpenApiContent;
import io.javalin.openapi.OpenApiParam;
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

    @OpenApi(
            path = "/api/party/{id}",
            methods = { HttpMethod.GET },
            tags = { "Party" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Retrieve a party with specific ID",
            description = "Returns the device with the given ID.",
            pathParams = { @OpenApiParam(
                    name = "id",
                    description = "Party ID: A unique number assigned to each party") },
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Party retrieved successfully",
                    content = { @OpenApiContent(
                            from = GetPartyResponse.class) }),
                    @OpenApiResponse(
                            status = "400",
                            description = "Non-numeric or non-positive party ID"),
                    @OpenApiResponse(
                            status = "404",
                            description = "ID does not match any existing devices"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void getParty(Context ctx) {
        String idStr = ctx.pathParam("id");
        try {
            int id = Integer.parseInt(idStr);
            GetPartyResponse result = service.getParty(id);
            ctx.status(200).json(result);
        } catch (NumberFormatException e) {
            ctx.status(400).result("Non-numeric party ID: " + idStr);
        } catch (BadArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (PartyNotFoundException e) {
            ctx.status(404).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }
}
