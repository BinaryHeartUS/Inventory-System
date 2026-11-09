package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;

import com.google.inject.Inject;
import io.javalin.http.Context;
import io.javalin.openapi.*;
import java.sql.SQLException;
import java.util.List;
import org.binaryheart.auth.AppRole;
import org.binaryheart.responses.ChapterSummary;
import org.binaryheart.services.ChapterService;

public class ChapterController {
	private final ChapterService service;

	@Inject
	public ChapterController(ChapterService service) {
		this.service = service;
	}

	public void registerRoutes() {
		get("", this::getChapters, AppRole.AUTHENTICATED);
	}

	@OpenApi(
		path = "/api/chapters",
		methods = {HttpMethod.GET},
		tags = {"Chapters"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "List Inventory chapters",
		responses = {@OpenApiResponse(
			status = "200",
			content = {@OpenApiContent(
				from = ChapterSummary[].class)}), @OpenApiResponse(
					status = "500",
					description = "Database error")})
	public void getChapters(Context ctx) {
		try {
			List<ChapterSummary> chapters = service.getAllChapters();
			ctx.json(chapters);
		} catch (SQLException e) {
			ctx.status(500).result("Database error");
			e.printStackTrace();
		}
	}
}
