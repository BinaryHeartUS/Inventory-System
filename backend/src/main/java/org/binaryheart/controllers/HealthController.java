package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;

import com.google.inject.Inject;
import io.javalin.http.Context;
import io.javalin.openapi.*;
import org.binaryheart.auth.AppRole;
import org.binaryheart.services.HealthService;

public class HealthController {

	private final HealthService service;

	@Inject
	public HealthController(HealthService service) {
		this.service = service;
	}

	public void registerRoutes() {
		get("/health", this::health, AppRole.PUBLIC);
		get("/ping", this::ping, AppRole.PUBLIC);
	}

	@OpenApi(
		path = "/api/health",
		methods = {HttpMethod.GET},
		tags = {"Health"},
		summary = "Health check",
		responses = {@OpenApiResponse(
			status = "200",
			description = "Service is up")})
	public void health(Context ctx) {
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
	public void ping(Context ctx) {
		ctx.result(service.ping());
	}
}
