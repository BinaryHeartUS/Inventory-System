package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;
import org.binaryheart.auth.AppRole;
import org.binaryheart.requests.LoginRequest;
import org.binaryheart.responses.LoginResponse;
import org.binaryheart.services.AuthService;

import java.sql.SQLException;

import static io.javalin.apibuilder.ApiBuilder.post;

public class AuthController {

    private static final AuthService service = new AuthService();

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
