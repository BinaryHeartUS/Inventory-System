package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;

import com.google.inject.Inject;
import io.javalin.http.Context;
import io.javalin.openapi.*;
import java.sql.SQLException;
import java.util.List;
import org.binaryheart.auth.AppRole;
import org.binaryheart.responses.ChapterSummary;
import org.binaryheart.responses.ChapterSyncStatus;
import org.binaryheart.services.ChapterService;
import org.binaryheart.jobs.chapters.ChapterSyncJob;

public class ChapterController {
	private final ChapterService service;
	private final ChapterSyncJob sync;

	@Inject
	public ChapterController(ChapterService service, ChapterSyncJob sync) {
		this.service = service;
		this.sync = sync;
	}

	public void registerRoutes() {
		get("", this::getChapters, AppRole.AUTHENTICATED);
		get("/sync", this::getSyncStatus, AppRole.ADMIN);
	}

	@OpenApi(
		path = "/api/chapters/sync",
		methods = {HttpMethod.GET},
		tags = {"Chapters"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Inspect this backend's chapter synchronization (National admins only)",
		responses = {@OpenApiResponse(
			status = "200",
			content = {@OpenApiContent(
				from = ChapterSyncStatus.class)})})
	public void getSyncStatus(Context ctx) {
		ctx.header("Cache-Control", "no-store");
		ctx.json(sync.status());
	}

	@OpenApi(
		path = "/api/chapters",
		methods = {HttpMethod.GET},
		tags = {"Chapters"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "List Inventory chapters",
		description = "Includes inactive chapters retained for historical inventory. Auth is the source of truth.",
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
