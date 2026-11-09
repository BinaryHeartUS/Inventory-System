package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;

import com.google.inject.Inject;
import io.javalin.http.Context;
import io.javalin.openapi.*;
import java.util.Map;
import org.binaryheart.auth.AppRole;
import org.binaryheart.auth.CentralAuthConfig;
import org.binaryheart.responses.LoginResponse;

public class AuthController {
	private final CentralAuthConfig config;

	@Inject
	public AuthController(CentralAuthConfig config) {
		this.config = config;
	}

	public void registerRoutes() {
		get("/config", ctx -> {
			ctx.header("Cache-Control", "no-store");
			ctx.json(Map.of("issuer", config.issuer(), "clientId", config.clientId()));
		}, AppRole.PUBLIC);
		get("/session", this::session, AppRole.AUTHENTICATED);
	}

	@OpenApi(
		path = "/api/auth/session",
		methods = {HttpMethod.GET},
		tags = {"Auth"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Get the verified BinaryHeart session",
		responses = {@OpenApiResponse(
			status = "200",
			content = {@OpenApiContent(
				from = LoginResponse.class)}), @OpenApiResponse(
					status = "401",
					description = "Invalid access token")})
	public void session(Context ctx) {
		ctx.header("Cache-Control", "no-store");
		String token = ctx.header("Authorization").substring(7);
		ctx.json(
			new LoginResponse(token, ctx.attribute("username"), ctx.attribute("chapterRoles"), ctx.attribute("role")));
	}
}
