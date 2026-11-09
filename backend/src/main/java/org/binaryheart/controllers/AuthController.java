package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.post;
import static io.javalin.apibuilder.ApiBuilder.get;

import com.google.inject.Inject;
import io.javalin.http.Context;
import io.javalin.openapi.HttpMethod;
import io.javalin.openapi.OpenApi;
import io.javalin.openapi.OpenApiContent;
import io.javalin.openapi.OpenApiRequestBody;
import io.javalin.openapi.OpenApiResponse;
import java.sql.SQLException;
import org.binaryheart.auth.AppRole;
import org.binaryheart.auth.CentralAuthConfig;
import org.binaryheart.requests.LoginRequest;
import org.binaryheart.responses.LoginResponse;
import org.binaryheart.services.AuthenticationService;

public class AuthController {

	private final AuthenticationService service;
	private final CentralAuthConfig config;

	@Inject
	public AuthController(AuthenticationService service, CentralAuthConfig config) {
		this.service = service;
		this.config = config;
	}

	public AuthController(AuthenticationService service) {
		this(service, new CentralAuthConfig(false, "", "inventory"));
	}

	public void registerRoutes() {
		get("/config", ctx -> {
			ctx.header("Cache-Control", "no-store");
			ctx.json(java.util.Map.of("enabled", config.enabled(), "issuer", config.issuer(), "clientId",
				config.clientId()));
		}, AppRole.PUBLIC);
		get("/session", ctx -> {
			ctx.header("Cache-Control", "no-store");
			String token = ctx.header("Authorization").substring(7);
			ctx.json(new LoginResponse(token, ctx.attribute("username"), ctx.attribute("chapterRoles"),
				ctx.attribute("role")));
		}, AppRole.AUTHENTICATED);
		if (!config.enabled()) {
			post("/login", this::login, AppRole.PUBLIC);
		}
	}

	@OpenApi(
		path = "/api/auth/login",
		methods = {HttpMethod.POST},
		tags = {"Auth"},
		summary = "Login",
		description = "Authenticate a volunteer and receive a JWT token",
		requestBody = @OpenApiRequestBody(
			required = true,
			content = {@OpenApiContent(
				from = LoginRequest.class,
				example = """
					{
					    "username": "user123",
					    "password": "pass123"
					}
					""")}),
		responses = {@OpenApiResponse(
			status = "200",
			description = "Login successful",
			content = {@OpenApiContent(
				from = LoginResponse.class)}), @OpenApiResponse(
					status = "400",
					description = "Missing username or password"),
				@OpenApiResponse(
					status = "401",
					description = "Invalid credentials"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public void login(Context ctx) {
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
