package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.post;

import java.sql.SQLException;
import java.util.List;

import org.binaryheart.auth.AppRole;
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

    /**
     * Throws 403 if the caller is not a member of the given chapter. Members of the
     * National chapter are granted access to all chapters.
     */
    public static void requireChapterAccess(Context ctx, int chapterId) throws SQLException {
        List<Integer> userChapterIds = ctx.attribute("chapterIds");
        if (userChapterIds == null || userChapterIds.isEmpty())
            throw new ForbiddenResponse("Access denied");
        if (userChapterIds.contains(chapterService.getNationalChapterId()))
            return;
        if (!userChapterIds.contains(chapterId))
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
