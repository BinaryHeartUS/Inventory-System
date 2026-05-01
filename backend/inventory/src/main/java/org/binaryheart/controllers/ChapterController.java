package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import io.javalin.openapi.*;
import org.binaryheart.auth.AppRole;
import org.binaryheart.requests.CreateChapterRequest;
import org.binaryheart.responses.ChapterSummary;
import org.binaryheart.services.ChapterService;

import java.sql.SQLException;
import java.util.List;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;

public class ChapterController {

    private static final ChapterService service = new ChapterService();

    public static void registerRoutes() {
        get("", ChapterController::getChapters, AppRole.AUTHENTICATED);
        post("", ChapterController::createChapter, AppRole.ADMIN);
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
            List<ChapterSummary> chapters = service.getAllChapters();
            ctx.json(chapters);
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
            e.printStackTrace();
        }
    }

    @OpenApi(
            path = "/api/chapters",
            methods = { HttpMethod.POST },
            tags = { "Chapters" },
            security = { @OpenApiSecurity(
                    name = "BearerAuth") },
            summary = "Create a new chapter",
            description = "Creates a new chapter. Restricted to national admins: users with the Admin role "
                    + "who are affiliated with the National chapter.",
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = CreateChapterRequest.class) }),
            responses = { @OpenApiResponse(
                    status = "201",
                    description = "Chapter created",
                    content = { @OpenApiContent(
                            from = ChapterSummary.class) }),
                    @OpenApiResponse(
                            status = "400",
                            description = "Missing or blank chapter name"),
                    @OpenApiResponse(
                            status = "403",
                            description = "Caller is not affiliated with the National chapter"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void createChapter(Context ctx) {
        List<Integer> chapterIds = ctx.attribute("chapterIds");
        try {
            int nationalId = service.getNationalChapterId();
            if (chapterIds == null || !chapterIds.contains(nationalId)) {
                throw new ForbiddenResponse();
            }
        } catch (ForbiddenResponse e) {
            throw e;
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
            e.printStackTrace();
            return;
        }

        CreateChapterRequest req = ctx.bodyAsClass(CreateChapterRequest.class);
        try {
            ChapterSummary created = service.createChapter(req.name());
            ctx.status(201).json(created);
        } catch (IllegalArgumentException e) {
            ctx.status(400).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
            e.printStackTrace();
        }
    }
}
