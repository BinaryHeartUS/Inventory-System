package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;

import io.javalin.http.Context;
import io.javalin.openapi.*;
import org.binaryheart.auth.AppRole;
import org.binaryheart.services.HealthService;

public class HealthController {

	private static final HealthService service = new HealthService();

	public static void registerRoutes() {
		get("/health", HealthController::health, AppRole.PUBLIC);
		get("/ping", HealthController::ping, AppRole.PUBLIC);
	}

	@OpenApi(
		path = "/api/health",
		methods = {HttpMethod.GET},
		tags = {"Health"},
		summary = "Health check",
		responses = {@OpenApiResponse(
			status = "200",
			description = "Service is up")})
	public static void health(Context ctx) {
		ctx.result(service.health());
	}

	@OpenApi(
		path = "/api/ping",
		methods = {HttpMethod.GET},
		tags = {"Health"},
		summary = "Ping",
		responses = {@OpenApiResponse(
			status = "200",
			description = "Returns pong")})
	public static void ping(Context ctx) {
		ctx.result(service.ping());
	}
}
