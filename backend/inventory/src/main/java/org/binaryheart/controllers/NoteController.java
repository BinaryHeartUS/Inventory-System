package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;

import org.binaryheart.auth.AppRole;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.responses.NoteResponse;
import org.binaryheart.services.NoteService;
import org.binaryheart.requests.PostNoteRequest;

import java.sql.SQLException;

import static io.javalin.apibuilder.ApiBuilder.post;
import static io.javalin.apibuilder.ApiBuilder.get;

public class NoteController {

    private static final NoteService service = new NoteService();

    public static void registerRoutes() {
        post("{id}/notes", NoteController::postNote, AppRole.AUTHENTICATED);
        get("{id}/notes", NoteController::getNotes, AppRole.AUTHENTICATED);
    }

    @OpenApi(
            path = "/api/assets/{id}/notes",
            methods = { HttpMethod.POST },
            tags = { "Assets" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Add a new note to an asset with the given ID",
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = PostNoteRequest.class,
                            example = """
                                    {
                                        "text": "New Note"
                                    }
                                    """) }),
            pathParams = { @OpenApiParam(
                    name = "id",
                    description = "The unique ID of the asset to which the new note will be assigned") },
            responses = { @OpenApiResponse(
                    status = "201",
                    description = "Note added successfully",
                    content = { @OpenApiContent(
                            from = NoteResponse.class) }),
                    @OpenApiResponse(
                            status = "400",
                            description = "Missing required parameters"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void postNote(Context ctx) {
        try {
            PostNoteRequest body = ctx.bodyAsClass(PostNoteRequest.class);
            int assetId = Integer.parseInt(ctx.pathParam("id"));
            NoteResponse res = service.addNote(assetId, body.text());
            ctx.status(200).json(res);
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
            return;
        } catch (MissingRequiredParametersException e) {
            ctx.status(400).result("Missing required parameter(s)");
            return;
        }
    }

    @OpenApi(
            path = "/api/assets/{id}/notes",
            methods = { HttpMethod.GET },
            tags = { "Assets" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Get a list of notes belonging to a given asset",
            pathParams = { @OpenApiParam(
                    name = "id",
                    description = "The unique ID of the asset whose notes will be retrieved") },
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Notes fetched successfully",
                    content = { @OpenApiContent(
                            from = NoteResponse[].class) }),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void getNotes(Context ctx) {
        try {
            int assetId = Integer.parseInt(ctx.pathParam("id"));
            NoteResponse[] res = service.getNotes(assetId);
            ctx.status(200).json(res);
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
            e.printStackTrace();
            return;
        }
    }
}
