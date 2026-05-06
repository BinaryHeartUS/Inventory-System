package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.delete;
import static io.javalin.apibuilder.ApiBuilder.get;

import java.security.InvalidParameterException;
import java.sql.SQLException;
import java.util.List;

import org.binaryheart.auth.AppRole;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.responses.PartResponse;
import org.binaryheart.services.PartService;

import io.javalin.http.Context;
import io.javalin.openapi.*;

public class PartController {

    private static final PartService service = new PartService();

    public static void registerRoutes() {
        get("", PartController::getAllParts, AppRole.AUTHENTICATED);
        get("/{id}", PartController::getPart, AppRole.AUTHENTICATED);
        delete("/{id}", PartController::deletePart, AppRole.AUTHENTICATED);
    }

    @OpenApi(
            path = "/api/parts",
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
            List<Integer> userChapterIds = ctx.attribute("chapterIds");
            PartResponse[] res = service.getAllParts(userChapterIds);
            ctx.status(200).json(res);
        } catch (SQLException e) {
            ctx.status(500).result("Datbase error: ".concat(e.getMessage()));
            return;
        }
    }

    @OpenApi(
            path = "/api/parts/{id}",
            methods = { HttpMethod.GET },
            tags = { "Parts" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Get information regarding a part currently in inventory",
            pathParams = { @OpenApiParam(
                    name = "id",
                    required = true,
                    description = "Part ID whose information to retrieve") },
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Parts fetched successfully",
                    content = { @OpenApiContent(
                            from = PartResponse.class) }),
                    @OpenApiResponse(
                            status = "400",
                            description = "Non-positive or non-numeric ID provided"),
                    @OpenApiResponse(
                            status = "404",
                            description = "No part with provided ID found"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error"), })
    public static void getPart(Context ctx) {
        try {
            List<Integer> userChapterIds = ctx.attribute("chapterIds");
            PartResponse res = service.getPart(userChapterIds, Integer.parseInt(ctx.pathParam("id")));

            if (res == null) {
                ctx.status(404).result("No part with provided ID found");
            } else {
                ctx.status(200).json(res);
            }
        } catch (SQLException e) {
            ctx.status(500).result("Datbase error: ".concat(e.getMessage()));
        } catch (MissingRequiredParametersException e) {
            ctx.status(400).result("Part ID must be positive integer; was non-numeric or non-positive");
        }
    }

    @OpenApi(
            path = "/api/parts/{id}",
            methods = { HttpMethod.DELETE },
            tags = { "Parts" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Get information regarding a part currently in inventory",
            pathParams = { @OpenApiParam(
                    name = "id",
                    required = true,
                    description = "Part ID to delete") },
            responses = { @OpenApiResponse(
                    status = "204",
                    description = "Part deleted",
                    content = { @OpenApiContent(
                            from = PartResponse.class) }),
                    @OpenApiResponse(
                            status = "400",
                            description = "Non-positive or non-numeric ID provided"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error"), })
    public static void deletePart(Context ctx) {
        try {
            List<Integer> userChapterIds = ctx.attribute("chapterIds");
            service.deletePart(userChapterIds, Integer.parseInt(ctx.pathParam("id")));
            ctx.status(204);
        } catch (SQLException e) {
            ctx.status(500).result("Datbase error: ".concat(e.getMessage()));
        } catch (InvalidParameterException e) {
            ctx.status(400).result(e.getMessage());
        }
    }
}
