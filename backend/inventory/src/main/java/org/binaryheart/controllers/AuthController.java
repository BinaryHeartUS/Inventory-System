package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.post;

import java.sql.SQLException;
import java.util.List;
import java.util.Set;

import org.binaryheart.auth.AppRole;
import org.binaryheart.models.ChapterRole;
import org.binaryheart.requests.LoginRequest;
import org.binaryheart.responses.LoginResponse;
import org.binaryheart.services.AuthService;
import org.binaryheart.services.ChapterService;

import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import io.javalin.openapi.HttpMethod;
import io.javalin.openapi.OpenApi;
import io.javalin.openapi.OpenApiContent;
import io.javalin.openapi.OpenApiRequestBody;
import io.javalin.openapi.OpenApiResponse;

public class AuthController {

    private static final AuthService service = new AuthService();
    private static final ChapterService chapterService = new ChapterService();

    private static final Set<String> WRITE_ROLES = Set.of("Admin", "Chapter Admin", "Editor");

    /**
     * Throws 403 if the caller does not have a write-capable role (Editor, Chapter
     * Admin, or Admin) for the given chapter.
     *
     * National membership is only sufficient if the caller's National role is
     * itself write-capable — a National Viewer cannot write to other chapters.
     */
    public static void requireChapterEditAccess(Context ctx, int chapterId) throws SQLException {
        List<ChapterRole> chapterRoles = ctx.attribute("chapterRoles");
        if (chapterRoles == null || chapterRoles.isEmpty())
            throw new ForbiddenResponse("Access denied");

        int nationalId = chapterService.getNationalChapterId();

        for (ChapterRole cr : chapterRoles) {
            if (!WRITE_ROLES.contains(cr.role()))
                continue;
            if (cr.chapterId() == nationalId)
                return;
            if (cr.chapterId() == chapterId)
                return;
        }

        throw new ForbiddenResponse("Access denied: insufficient role for chapter " + chapterId);
    }

    /**
     * Throws 403 if the caller is not affiliated with the given chapter in any
     * role. Members of the National chapter (any role) can read all chapters.
     */
    public static void requireChapterReadAccess(Context ctx, int chapterId) throws SQLException {
        List<ChapterRole> chapterRoles = ctx.attribute("chapterRoles");
        if (chapterRoles == null || chapterRoles.isEmpty())
            throw new ForbiddenResponse("Access denied");

        int nationalId = chapterService.getNationalChapterId();

        for (ChapterRole cr : chapterRoles) {
            if (cr.chapterId() == nationalId)
                return;
            if (cr.chapterId() == chapterId)
                return;
        }

        throw new ForbiddenResponse("Access denied: not a member of chapter " + chapterId);
    }

    public static void registerRoutes() {
        post("/login", AuthController::login, AppRole.PUBLIC);
    }

    @OpenApi(
            path = "/api/auth/login",
            methods = { HttpMethod.POST },
            tags = { "Auth" },
            summary = "Login",
            description = "Authenticate a volunteer and receive a JWT token",
            requestBody = @OpenApiRequestBody(
                    required = true,
                    content = { @OpenApiContent(
                            from = LoginRequest.class) }),
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Login successful",
                    content = { @OpenApiContent(
                            from = LoginResponse.class) }),
                    @OpenApiResponse(
                            status = "400",
                            description = "Missing username or password"),
                    @OpenApiResponse(
                            status = "401",
                            description = "Invalid credentials"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void login(Context ctx) {
        LoginRequest request = ctx.bodyAsClass(LoginRequest.class);

        if (request.username() == null || request.username().isBlank() || request.password() == null
                || request.password().isBlank()) {
            ctx.status(400).result("Username and password are required");
            return;
        }

        try {
            LoginResponse response = service.login(request.username(), request.password());
            if (response == null) {
                ctx.status(401).result("Invalid credentials");
                return;
            }
            ctx.status(200).json(response);
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
            e.printStackTrace();
        }
    }
}
