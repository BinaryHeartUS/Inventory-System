package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;
import org.binaryheart.auth.AppRole;
import org.binaryheart.repositories.ChapterRepository;
import org.binaryheart.responses.ChapterSummary;

import java.sql.SQLException;
import java.util.List;

import static io.javalin.apibuilder.ApiBuilder.get;

public class ChapterController {

    private static final ChapterRepository repository = new ChapterRepository();

    public static void registerRoutes() {
        get("", ChapterController::getChapters, AppRole.AUTHENTICATED);
    }

    @OpenApi(
            path = "/api/chapters",
            methods = { HttpMethod.GET },
            tags = { "Chapters" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "List all chapters",
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Chapter list",
                    content = { @OpenApiContent(
                            from = ChapterSummary[].class) }),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void getChapters(Context ctx) {
        try {
            List<ChapterSummary> chapters = repository.getAllChapters();
            ctx.json(chapters);
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
            e.printStackTrace();
        }
    }
}
