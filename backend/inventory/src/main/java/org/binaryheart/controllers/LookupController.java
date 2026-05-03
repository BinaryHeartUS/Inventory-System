package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;
import org.binaryheart.auth.AppRole;
import org.binaryheart.requests.AddLookupRequest;
import org.binaryheart.responses.LookupResponse;
import org.binaryheart.services.LookupService;

import java.sql.SQLException;

import static io.javalin.apibuilder.ApiBuilder.*;

public class LookupController {

    private static final LookupService service = new LookupService();

    public static void registerRoutes() {
        get("", LookupController::getAll, AppRole.AUTHENTICATED);
        post("/manufacturers", LookupController::addManufacturer, AppRole.AUTHENTICATED);
        post("/ram-generations", LookupController::addRamGeneration, AppRole.AUTHENTICATED);
        post("/storage-types", LookupController::addStorageType, AppRole.AUTHENTICATED);
        post("/part-types", LookupController::addPartType, AppRole.AUTHENTICATED);
        delete("/manufacturers/{name}", LookupController::deleteManufacturer, AppRole.ADMIN);
        delete("/ram-generations/{name}", LookupController::deleteRamGeneration, AppRole.ADMIN);
        delete("/storage-types/{name}", LookupController::deleteStorageType, AppRole.ADMIN);
        delete("/part-types/{name}", LookupController::deletePartType, AppRole.ADMIN);
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

    @OpenApi(
            path = "/api/lookup/manufacturers",
            methods = { HttpMethod.POST },
            tags = { "Lookup" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Add a manufacturer",
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = AddLookupRequest.class) }),
            responses = { @OpenApiResponse(
                    status = "201",
                    description = "Added"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void addManufacturer(Context ctx) {
        AddLookupRequest req = ctx.bodyAsClass(AddLookupRequest.class);
        try {
            service.addManufacturer(req.name());
            ctx.status(201);
        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }

    @OpenApi(
            path = "/api/lookup/ram-generations",
            methods = { HttpMethod.POST },
            tags = { "Lookup" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Add a RAM generation",
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = AddLookupRequest.class) }),
            responses = { @OpenApiResponse(
                    status = "201",
                    description = "Added"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void addRamGeneration(Context ctx) {
        AddLookupRequest req = ctx.bodyAsClass(AddLookupRequest.class);
        try {
            service.addRamGeneration(req.name());
            ctx.status(201);
        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }

    @OpenApi(
            path = "/api/lookup/storage-types",
            methods = { HttpMethod.POST },
            tags = { "Lookup" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Add a storage type",
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = AddLookupRequest.class) }),
            responses = { @OpenApiResponse(
                    status = "201",
                    description = "Added"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void addStorageType(Context ctx) {
        AddLookupRequest req = ctx.bodyAsClass(AddLookupRequest.class);
        try {
            service.addStorageType(req.name());
            ctx.status(201);
        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }

    @OpenApi(
            path = "/api/lookup/part-types",
            methods = { HttpMethod.POST },
            tags = { "Lookup" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Add a part type",
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = AddLookupRequest.class) }),
            responses = { @OpenApiResponse(
                    status = "201",
                    description = "Added"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void addPartType(Context ctx) {
        AddLookupRequest req = ctx.bodyAsClass(AddLookupRequest.class);
        try {
            service.addPartType(req.name());
            ctx.status(201);
        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }

    @OpenApi(
            path = "/api/lookup/manufacturers/{name}",
            methods = { HttpMethod.DELETE },
            tags = { "Lookup" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Delete a manufacturer",
            pathParams = { @OpenApiParam(
                    name = "name") },
            responses = { @OpenApiResponse(
                    status = "204",
                    description = "Deleted"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void deleteManufacturer(Context ctx) {
        String name = ctx.pathParam("name");
        try {
            service.removeManufacturer(name);
            ctx.status(204);
        } catch (SQLException e) {
            if ("23503".equals(e.getSQLState()))
                ctx.status(409).result("Cannot delete \"" + name + "\" because it is still in use.");
            else
                ctx.status(500).result("Database error: " + e.getMessage());
        }
    }

    @OpenApi(
            path = "/api/lookup/ram-generations/{name}",
            methods = { HttpMethod.DELETE },
            tags = { "Lookup" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Delete a RAM generation",
            pathParams = { @OpenApiParam(
                    name = "name") },
            responses = { @OpenApiResponse(
                    status = "204",
                    description = "Deleted"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void deleteRamGeneration(Context ctx) {
        String name = ctx.pathParam("name");
        try {
            service.removeRamGeneration(name);
            ctx.status(204);
        } catch (SQLException e) {
            if ("23503".equals(e.getSQLState()))
                ctx.status(409).result("Cannot delete \"" + name + "\" because it is still in use.");
            else
                ctx.status(500).result("Database error: " + e.getMessage());
        }
    }

    @OpenApi(
            path = "/api/lookup/storage-types/{name}",
            methods = { HttpMethod.DELETE },
            tags = { "Lookup" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Delete a storage type",
            pathParams = { @OpenApiParam(
                    name = "name") },
            responses = { @OpenApiResponse(
                    status = "204",
                    description = "Deleted"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void deleteStorageType(Context ctx) {
        String name = ctx.pathParam("name");
        try {
            service.removeStorageType(name);
            ctx.status(204);
        } catch (SQLException e) {
            if ("23503".equals(e.getSQLState()))
                ctx.status(409).result("Cannot delete \"" + name + "\" because it is still in use.");
            else
                ctx.status(500).result("Database error: " + e.getMessage());
        }
    }

    @OpenApi(
            path = "/api/lookup/part-types/{name}",
            methods = { HttpMethod.DELETE },
            tags = { "Lookup" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Delete a part type",
            pathParams = { @OpenApiParam(
                    name = "name") },
            responses = { @OpenApiResponse(
                    status = "204",
                    description = "Deleted"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void deletePartType(Context ctx) {
        String name = ctx.pathParam("name");
        try {
            service.removePartType(name);
            ctx.status(204);
        } catch (SQLException e) {
            if ("23503".equals(e.getSQLState()))
                ctx.status(409).result("Cannot delete \"" + name + "\" because it is still in use.");
            else
                ctx.status(500).result("Database error: " + e.getMessage());
        }
    }

}
