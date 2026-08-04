package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;

import com.google.inject.Inject;
import io.javalin.http.Context;
import io.javalin.openapi.*;
import java.sql.SQLException;
import org.binaryheart.auth.AppRole;
import org.binaryheart.services.HealthService;

public class HealthController {

	private final HealthService service;

	@Inject
	public HealthController(HealthService service) {
		this.service = service;
	}

	public void registerRoutes() {
		get("/health/live", this::live, AppRole.PUBLIC);
		get("/health/ready", this::ready, AppRole.PUBLIC);
	}

	@OpenApi(
		path = "/api/health/live",
		methods = {HttpMethod.GET},
		tags = {"Health"},
		summary = "Liveness check",
		responses = {@OpenApiResponse(
			status = "200",
			description = "Service is running")})
	public void live(Context ctx) {
		ctx.result(service.live());
	}

	@OpenApi(
		path = "/api/health/ready",
		methods = {HttpMethod.GET},
		tags = {"Health"},
		summary = "Readiness check",
		responses = {@OpenApiResponse(
			status = "200",
			description = "Service and database are ready"),
				@OpenApiResponse(
					status = "503",
					description = "Database is unavailable")})
	public void ready(Context ctx) {
		try {
			ctx.result(service.ready());
		} catch (SQLException e) {
			ctx.status(503).result("Database unavailable");
		}
	}
}
