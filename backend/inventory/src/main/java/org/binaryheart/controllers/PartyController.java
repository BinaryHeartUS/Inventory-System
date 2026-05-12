package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;

import java.sql.SQLException;
import java.util.List;

import org.binaryheart.auth.AppRole;
import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.exceptions.PartyNotFoundException;
import org.binaryheart.requests.InsertOrganizationRequest;
import org.binaryheart.requests.InsertPersonRequest;
import org.binaryheart.responses.GetPartyResponse;
import org.binaryheart.services.PartyService;

import io.javalin.http.Context;
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
        post("/organization", PartyController::insertOrg, AppRole.AUTHENTICATED);
        post("/person", PartyController::insertPerson, AppRole.AUTHENTICATED);
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

    @OpenApi(
            path = "/api/party/organization",
            methods = { HttpMethod.POST },
            tags = { "Party" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Insert a new organization",
            description = "Creates a new organization with the provided attributes",
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = InsertOrganizationRequest.class,
                            example = """
                                    {
                                        "name": "Rose-Hulman Institute of Technology",
                                        "location": "(5500 Wabash Ave, Terre Haute, IN, 47803, USA)",
                                        "contactName": null,
                                        "contactEmail": null
                                    }
                                    """) }),
            responses = { @OpenApiResponse(
                    status = "201",
                    description = "Organization added successfully"),
                    @OpenApiResponse(
                            status = "400",
                            description = "Missing required parameters or invalid field values"),
                    @OpenApiResponse(
                            status = "409",
                            description = "Party ID already exists"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void insertOrg(Context ctx) {
        InsertOrganizationRequest request = ctx.bodyAsClass(InsertOrganizationRequest.class);

        try {
            service.addOrganization(request);
            ctx.status(201).result("Organization added successfully");
        } catch (BadArgumentException | MissingRequiredParametersException e) {
            ctx.status(400).result(e.getMessage());
        } catch (DuplicateKeyException e) {
            ctx.status(409).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
        ctx.status(201);
    }

    @OpenApi(
            path = "/api/party/person",
            methods = { HttpMethod.POST },
            tags = { "Party" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Insert a new person",
            description = "Creates a new person with the provided attributes",
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = InsertPersonRequest.class,
                            example = """
                                    {
                                        "name": "John Doe",
                                        "location": "(123 Main St, Terre Haute, IN, 47803, USA)",
                                        "email": ""
                                    }
                                    """) }),
            responses = { @OpenApiResponse(
                    status = "201",
                    description = "Person added successfully"),
                    @OpenApiResponse(
                            status = "400",
                            description = "Missing required parameters or invalid field values"),
                    @OpenApiResponse(
                            status = "409",
                            description = "Party ID already exists"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void insertPerson(Context ctx) {
        InsertPersonRequest request = ctx.bodyAsClass(InsertPersonRequest.class);

        try {
            service.addPerson(request);
            ctx.status(201).result("Person added successfully");
        } catch (BadArgumentException | MissingRequiredParametersException e) {
            ctx.status(400).result(e.getMessage());
        } catch (DuplicateKeyException e) {
            ctx.status(409).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
        ctx.status(201);
    }
}
