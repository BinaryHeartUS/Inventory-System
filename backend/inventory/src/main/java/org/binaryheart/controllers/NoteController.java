package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;

import org.binaryheart.Exceptions.MissingRequiredParametersException;
import org.binaryheart.auth.AppRole;
import org.binaryheart.responses.NoteResponse;
import org.binaryheart.services.NoteService;
import org.binaryheart.requests.PostNoteRequest;

import java.sql.SQLException;

import static io.javalin.apibuilder.ApiBuilder.post;

public class NoteController {

    private static final NoteService service = new NoteService();

    public static void registerRoutes() {
        post("{id}/notes", NoteController::postNote, AppRole.AUTHENTICATED);
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
            responses = { @OpenApiResponse(
                    status = "200",
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
}
