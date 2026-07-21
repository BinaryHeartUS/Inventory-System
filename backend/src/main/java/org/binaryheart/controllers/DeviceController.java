package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.path;
import static io.javalin.apibuilder.ApiBuilder.post;
import static io.javalin.apibuilder.ApiBuilder.put;

import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import io.javalin.openapi.HttpMethod;
import io.javalin.openapi.OpenApi;
import io.javalin.openapi.OpenApiContent;
import io.javalin.openapi.OpenApiParam;
import io.javalin.openapi.OpenApiRequestBody;
import io.javalin.openapi.OpenApiResponse;
import io.javalin.openapi.OpenApiSecurity;
import java.security.InvalidParameterException;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.binaryheart.auth.AppRole;
import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DeviceNotFoundException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.ForbiddenException;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.requests.InsertDesktopRequest;
import org.binaryheart.requests.InsertLaptopRequest;
import org.binaryheart.requests.InsertTabletRequest;
import org.binaryheart.responses.AvgTimeInInventoryResponse;
import org.binaryheart.responses.ChapterActivityStatsResponse;
import org.binaryheart.responses.CompletionRateResponse;
import org.binaryheart.responses.DashboardCountsResponse;
import org.binaryheart.responses.DeviceChangelogResponse;
import org.binaryheart.responses.GetDeviceResponse;
import org.binaryheart.responses.MonthlyCountPoint;
import org.binaryheart.responses.MonthlyValuePoint;
import org.binaryheart.services.ChapterService;
import org.binaryheart.services.DeviceService;

public class DeviceController {

	private static final DeviceService service = new DeviceService();
	private static final ChapterService chapterService = new ChapterService();

	public static void registerRoutes() {
		path("/stats", () -> {
			get("/counts", DeviceController::getDashboardCounts, AppRole.AUTHENTICATED);
			get("/count/{type}", DeviceController::getDeviceCount, AppRole.AUTHENTICATED);
			get("/avg-time", DeviceController::getAvgTimeInInventory, AppRole.AUTHENTICATED);
			get("/completion-rate", DeviceController::getCompletionRate, AppRole.AUTHENTICATED);
			get("/chapter-activity", DeviceController::getChapterActivityStats, AppRole.AUTHENTICATED);
			get("/devices-received", DeviceController::getDevicesReceived, AppRole.AUTHENTICATED);
			get("/devices-donated", DeviceController::getDevicesDonated, AppRole.AUTHENTICATED);
			get("/donated-value", DeviceController::getDonatedDeviceValue, AppRole.AUTHENTICATED);
		});
		get("/{id}", DeviceController::getDevice, AppRole.AUTHENTICATED);
		get("/{id}/changelog", DeviceController::getDeviceChangelog, AppRole.AUTHENTICATED);
		get("", DeviceController::getAllDevices, AppRole.AUTHENTICATED);
		post("/desktop", DeviceController::insertDesktop, AppRole.AUTHENTICATED);
		post("/laptop", DeviceController::insertLaptop, AppRole.AUTHENTICATED);
		post("/tablet", DeviceController::insertTablet, AppRole.AUTHENTICATED);
		put("/desktop/{id}", DeviceController::updateDesktop, AppRole.AUTHENTICATED);
		put("/laptop/{id}", DeviceController::updateLaptop, AppRole.AUTHENTICATED);
		put("/tablet/{id}", DeviceController::updateTablet, AppRole.AUTHENTICATED);
	}

	private static List<Integer> parseChapterIds(Context ctx) throws BadArgumentException {
		String raw = ctx.queryParam("chapters");
		if (raw == null || raw.isBlank())
			return List.of();
		try {
			return Arrays.stream(raw.split(",")).map(String::trim).filter(s -> !s.isEmpty()).map(Integer::parseInt)
				.collect(Collectors.toList());
		} catch (NumberFormatException e) {
			throw new BadArgumentException("Invalid chapter ID in 'chapters' parameter: " + raw);
		}
	}

	@OpenApi(
		path = "/api/devices/stats/counts",
		methods = {HttpMethod.GET},
		tags = {"Device Stats"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "All dashboard counts in a single request",
		description = "Returns all eight pipeline and device-type counts needed by the dashboard in one call, "
			+ "optionally filtered to specific chapters. "
			+ "Pipeline counts (not-started, in-progress, ready-to-donate, donated) cover all device types. "
			+ "Active type counts (desktop, laptop, tablet, total) exclude Donated and Ready To Donate devices.",
		queryParams = {@OpenApiParam(
			name = "chapters",
			required = false,
			description = "Comma-separated list of chapter IDs to filter by. Defaults to all accessible chapters.")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Dashboard counts retrieved successfully",
			content = {@OpenApiContent(
				from = DashboardCountsResponse.class)}), @OpenApiResponse(
					status = "400",
					description = "Invalid chapter ID"),
				@OpenApiResponse(
					status = "403",
					description = "Access denied for a requested chapter"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void getDashboardCounts(Context ctx) {
		try {
			List<Integer> requestedChapterIds = parseChapterIds(ctx);
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			ctx.status(200).json(service.getDashboardCounts(requestedChapterIds, userChapterIds));
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (ForbiddenException e) {
			ctx.status(403).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/stats/count/{type}",
		methods = {HttpMethod.GET},
		tags = {"Device Stats"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Retrieve the number of devices of a given type",
		description = "Returns the count of devices by type and status, optionally filtered to specific chapters. "
			+ "Status values: active (default), not-started, in-progress, ready-to-donate, donated. "
			+ "Type values: desktop, laptop, tablet, total.",
		pathParams = {@OpenApiParam(
			name = "type",
			description = "Device type: desktop, laptop, tablet, or total")},
		queryParams = {@OpenApiParam(
			name = "status",
			required = false,
			description = "Filter by status: active (default), not-started, in-progress, ready-to-donate, donated"),
				@OpenApiParam(
					name = "chapters",
					required = false,
					description = "Comma-separated list of chapter IDs to filter by. Defaults to all accessible chapters.")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Count retrieved successfully",
			content = {@OpenApiContent(
				from = Integer.class)}), @OpenApiResponse(
					status = "400",
					description = "Invalid device type, status, or chapter ID"),
				@OpenApiResponse(
					status = "403",
					description = "Access denied for a requested chapter"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void getDeviceCount(Context ctx) {
		String type = ctx.pathParam("type").toLowerCase();
		String status = ctx.queryParam("status") == null ? "active" : ctx.queryParam("status").toLowerCase();

		try {
			List<Integer> requestedChapterIds = parseChapterIds(ctx);
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			int count = service.getDeviceCount(type, status, requestedChapterIds, userChapterIds);
			ctx.status(200).json(count);
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (ForbiddenException e) {
			ctx.status(403).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/stats/avg-time",
		methods = {HttpMethod.GET},
		tags = {"Device Stats"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Average time from acquisition to donation",
		description = "Returns the average number of days between acquisition and donation for donated devices, "
			+ "optionally filtered to specific chapters.",
		queryParams = {@OpenApiParam(
			name = "chapters",
			required = false,
			description = "Comma-separated chapter IDs. Defaults to all accessible chapters.")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Average time retrieved successfully",
			content = {@OpenApiContent(
				from = AvgTimeInInventoryResponse.class)}), @OpenApiResponse(
					status = "403",
					description = "Access denied for a requested chapter"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void getAvgTimeInInventory(Context ctx) {
		try {
			List<Integer> requestedChapterIds = parseChapterIds(ctx);
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			ctx.status(200).json(service.getAvgTimeInInventory(requestedChapterIds, userChapterIds));
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (ForbiddenException e) {
			ctx.status(403).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/stats/completion-rate",
		methods = {HttpMethod.GET},
		tags = {"Device Stats"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Donated vs total (non-scrapped) device completion rate",
		description = "Returns the count of donated devices and the count of all non-scrapped/unknown devices, "
			+ "optionally filtered to specific chapters.",
		queryParams = {@OpenApiParam(
			name = "chapters",
			required = false,
			description = "Comma-separated chapter IDs. Defaults to all accessible chapters.")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Completion rate data retrieved successfully",
			content = {@OpenApiContent(
				from = CompletionRateResponse.class)}), @OpenApiResponse(
					status = "403",
					description = "Access denied for a requested chapter"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void getCompletionRate(Context ctx) {
		try {
			List<Integer> requestedChapterIds = parseChapterIds(ctx);
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			ctx.status(200).json(service.getCompletionRate(requestedChapterIds, userChapterIds));
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (ForbiddenException e) {
			ctx.status(403).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/stats/chapter-activity",
		methods = {HttpMethod.GET},
		tags = {"Device Stats"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Chapter activity summary",
		description = "Returns counts of active chapters, chapters working on devices, and chapters with pickups ready, "
			+ "across all chapters visible to the caller.",
		responses = {@OpenApiResponse(
			status = "200",
			description = "Chapter activity stats retrieved successfully",
			content = {@OpenApiContent(
				from = ChapterActivityStatsResponse.class)}), @OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void getChapterActivityStats(Context ctx) {
		try {
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			ctx.status(200).json(service.getChapterActivityStats(userChapterIds));
		} catch (ForbiddenException e) {
			ctx.status(403).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/stats/devices-received",
		methods = {HttpMethod.GET},
		tags = {"Device Stats"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Monthly devices received",
		description = "Returns the count of devices received (by acquisition date) per month for the last N months (default 12). "
			+ "Optionally filtered to specific chapters.",
		queryParams = {@OpenApiParam(
			name = "months",
			required = false,
			description = "Number of months to look back (1-120, default 12)"),
				@OpenApiParam(
					name = "chapters",
					required = false,
					description = "Comma-separated chapter IDs. Defaults to all accessible chapters.")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Monthly received data retrieved successfully",
			content = {@OpenApiContent(
				from = MonthlyCountPoint[].class)}), @OpenApiResponse(
					status = "400",
					description = "Invalid months value or chapter ID"),
				@OpenApiResponse(
					status = "403",
					description = "Access denied for a requested chapter"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void getDevicesReceived(Context ctx) {
		try {
			int months = parseMonths(ctx);
			List<Integer> requestedChapterIds = parseChapterIds(ctx);
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			ctx.status(200).json(service.getDevicesReceived(requestedChapterIds, userChapterIds, months));
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (ForbiddenException e) {
			ctx.status(403).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/stats/devices-donated",
		methods = {HttpMethod.GET},
		tags = {"Device Stats"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Monthly devices donated",
		description = "Returns the count of devices donated per month for the last N months (default 12). "
			+ "Optionally filtered to specific chapters.",
		queryParams = {@OpenApiParam(
			name = "months",
			required = false,
			description = "Number of months to look back (1-120, default 12)"),
				@OpenApiParam(
					name = "chapters",
					required = false,
					description = "Comma-separated chapter IDs. Defaults to all accessible chapters.")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Monthly donated data retrieved successfully",
			content = {@OpenApiContent(
				from = MonthlyCountPoint[].class)}), @OpenApiResponse(
					status = "400",
					description = "Invalid months value or chapter ID"),
				@OpenApiResponse(
					status = "403",
					description = "Access denied for a requested chapter"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void getDevicesDonated(Context ctx) {
		try {
			int months = parseMonths(ctx);
			List<Integer> requestedChapterIds = parseChapterIds(ctx);
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			ctx.status(200).json(service.getDevicesDonated(requestedChapterIds, userChapterIds, months));
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (ForbiddenException e) {
			ctx.status(403).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/stats/donated-value",
		methods = {HttpMethod.GET},
		tags = {"Device Stats"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Monthly value of donated devices",
		description = "Returns the total value of donated devices per month for the last N months (default 12). "
			+ "Optionally filtered to specific chapters.",
		queryParams = {@OpenApiParam(
			name = "months",
			required = false,
			description = "Number of months to look back (1-120, default 12)"),
				@OpenApiParam(
					name = "chapters",
					required = false,
					description = "Comma-separated chapter IDs. Defaults to all accessible chapters.")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Monthly value data retrieved successfully",
			content = {@OpenApiContent(
				from = MonthlyValuePoint[].class)}), @OpenApiResponse(
					status = "400",
					description = "Invalid months value or chapter ID"),
				@OpenApiResponse(
					status = "403",
					description = "Access denied for a requested chapter"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void getDonatedDeviceValue(Context ctx) {
		try {
			int months = parseMonths(ctx);
			List<Integer> requestedChapterIds = parseChapterIds(ctx);
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			ctx.status(200).json(service.getDonatedDeviceValue(requestedChapterIds, userChapterIds, months));
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (ForbiddenException e) {
			ctx.status(403).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	private static int parseMonths(Context ctx) throws BadArgumentException {
		String raw = ctx.queryParam("months");
		if (raw == null || raw.isBlank())
			return 12;
		try {
			return Integer.parseInt(raw.trim());
		} catch (NumberFormatException e) {
			throw new BadArgumentException("Invalid value for 'months': " + raw);
		}
	}

	@OpenApi(
		path = "/api/devices/{id}",
		methods = {HttpMethod.GET},
		tags = {"Devices"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Retrieve a device with a specific ID",
		description = "Returns the device with the given ID.",
		pathParams = {@OpenApiParam(
			name = "id",
			description = "Device ID: A unique number assigned to each device")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Device retrieved successfully",
			content = {@OpenApiContent(
				from = GetDeviceResponse.class)}), @OpenApiResponse(
					status = "400",
					description = "Non-numeric or non-positive device ID"),
				@OpenApiResponse(
					status = "404",
					description = "ID does not match any existing devices"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void getDevice(Context ctx) {
		String idStr = ctx.pathParam("id");
		try {
			int id = Integer.parseInt(idStr);
			GetDeviceResponse result = service.getDevice(id);
			Integer deviceChapterId = chapterService.getChapterIdByName(result.chapter());
			if (deviceChapterId == null)
				throw new ForbiddenResponse("Access denied");
			AuthController.requireChapterReadAccess(ctx, deviceChapterId);
			ctx.status(200).json(result);
		} catch (NumberFormatException e) {
			ctx.status(400).result("Non-numeric device ID: " + idStr);
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (DeviceNotFoundException e) {
			ctx.status(404).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices",
		methods = {HttpMethod.GET},
		tags = {"Devices"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Retrieve all devices",
		description = "Returns a list of all devices.",
		responses = {@OpenApiResponse(
			status = "200",
			description = "Devices retrieved successfully",
			content = {@OpenApiContent(
				from = GetDeviceResponse[].class)}), @OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void getAllDevices(Context ctx) {
		try {
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			List<GetDeviceResponse> devices = service.getAllDevices(userChapterIds);
			ctx.status(200).json(devices.toArray(new GetDeviceResponse[0]));
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/desktop",
		methods = {HttpMethod.POST},
		tags = {"Devices"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Add a new desktop to the database",
		description = "Adds a desktop with the specified attributes",
		requestBody = @OpenApiRequestBody(
			required = true,
			content = {@OpenApiContent(
				from = InsertDesktopRequest.class,
				example = """
					{
					  "chapterId": 1,
					  "manufacturer": "Dell",
					  "model": "Optiplex 7010",
					  "year": 2022,
					  "status": "Not Started",
					  "assetId": null,
					  "cpu": null,
					  "ram": null,
					  "ramGeneration": null,
					  "storageAmount": null,
					  "storageType": null,
					  "value": null,
					  "acquisitionDate": null,
					  "recipientId": null,
					  "donorId": null,
					  "hasWifi": null
					}""")}),
		responses = {@OpenApiResponse(
			status = "201",
			description = "Desktop added successfully"),
				@OpenApiResponse(
					status = "400",
					description = "Missing required parameters or invalid field values"),
				@OpenApiResponse(
					status = "409",
					description = "Asset ID already exists"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void insertDesktop(Context ctx) {
		InsertDesktopRequest request = ctx.bodyAsClass(InsertDesktopRequest.class);

		try {
			AuthController.requireChapterEditAccess(ctx, request.chapterId());
			service.insertDesktop(request, ctx.attribute("username"));
			ctx.status(201).result("Desktop added successfully");
		} catch (MissingRequiredParametersException | BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (DuplicateKeyException e) {
			ctx.status(409).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/laptop",
		methods = {HttpMethod.POST},
		tags = {"Devices"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Add a new laptop to the database",
		description = "Adds a laptop with the specified attributes",
		requestBody = @OpenApiRequestBody(
			required = true,
			content = {@OpenApiContent(
				from = InsertLaptopRequest.class,
				example = """
					{
					  "chapterId": 1,
					  "manufacturer": "Dell",
					  "model": "Optiplex 7010",
					  "year": 2022,
					  "status": "Not Started",
					  "includesCharger": "Included",
					  "assetId": null,
					  "cpu": null,
					  "ram": null,
					  "ramGeneration": null,
					  "storageAmount": null,
					  "storageType": null,
					  "value": null,
					  "acquisitionDate": null,
					  "recipientId": null,
					  "donorId": null,
					  "designBatteryCapacity": null,
					  "actualBatteryCapacity": null
					}""")}),
		responses = {@OpenApiResponse(
			status = "201",
			description = "Laptop added successfully"),
				@OpenApiResponse(
					status = "400",
					description = "Missing required parameters or invalid field values"),
				@OpenApiResponse(
					status = "409",
					description = "Asset ID already exists"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void insertLaptop(Context ctx) {
		InsertLaptopRequest request = ctx.bodyAsClass(InsertLaptopRequest.class);

		try {
			AuthController.requireChapterEditAccess(ctx, request.chapterId());
			service.insertLaptop(request, ctx.attribute("username"));
			ctx.status(201).result("Laptop added successfully");
		} catch (MissingRequiredParametersException | BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (DuplicateKeyException e) {
			ctx.status(409).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/tablet",
		methods = {HttpMethod.POST},
		tags = {"Devices"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Add a new tablet to the database",
		description = "Adds a tablet with the specified attributes",
		requestBody = @OpenApiRequestBody(
			required = true,
			content = {@OpenApiContent(
				from = InsertTabletRequest.class,
				example = """
					{
					  "chapterId": 1,
					  "manufacturer": "Dell",
					  "model": "Optiplex 7010",
					  "year": 2022,
					  "status": "Not Started",
					  "includesCharger": "Included",
					  "assetId": null,
					  "cpu": null,
					  "ram": null,
					  "ramGeneration": null,
					  "storageAmount": null,
					  "storageType": null,
					  "value": null,
					  "acquisitionDate": null,
					  "recipientId": null,
					  "donorId": null,
					  "workingBattery": "Yes"
					}""")}),
		responses = {@OpenApiResponse(
			status = "201",
			description = "Tablet added successfully"),
				@OpenApiResponse(
					status = "400",
					description = "Missing required parameters or invalid field values"),
				@OpenApiResponse(
					status = "409",
					description = "Asset ID already exists"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void insertTablet(Context ctx) {
		InsertTabletRequest request = ctx.bodyAsClass(InsertTabletRequest.class);

		try {
			AuthController.requireChapterEditAccess(ctx, request.chapterId());
			service.insertTablet(request, ctx.attribute("username"));
			ctx.status(201).result("Tablet added successfully");
		} catch (MissingRequiredParametersException | BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (DuplicateKeyException e) {
			ctx.status(409).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/desktop/{id}",
		methods = {HttpMethod.PUT},
		tags = {"Devices"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Updates a desktop in the database",
		description = "Updates a desktop with the specified ID and attributes",
		pathParams = {@OpenApiParam(
			name = "id",
			description = "The asset ID of the desktop to update"),},
		requestBody = @OpenApiRequestBody(
			required = true,
			content = {@OpenApiContent(
				from = InsertDesktopRequest.class,
				example = """
					{
					  "chapterId": 1,
					  "manufacturer": "Dell",
					  "model": "Optiplex 7010",
					  "year": 2022,
					  "status": "Not Started",
					  "assetId": 10000,
					  "cpu": null,
					  "ram": null,
					  "ramGeneration": null,
					  "storageAmount": null,
					  "storageType": null,
					  "value": null,
					  "acquisitionDate": null,
					  "recipientId": null,
					  "donorId": null,
					  "hasWifi": null
					}""")}),
		responses = {@OpenApiResponse(
			status = "201",
			description = "Desktop updated successfully"),
				@OpenApiResponse(
					status = "400",
					description = "Missing required parameters or invalid field values"),
				@OpenApiResponse(
					status = "401",
					description = "Desktop with specified ID does not exist"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void updateDesktop(Context ctx) {
		InsertDesktopRequest request = ctx.bodyAsClass(InsertDesktopRequest.class);

		try {
			AuthController.requireChapterEditAccess(ctx, request.chapterId());
			service.updateDesktop(request, ctx.attribute("username"));
			ctx.status(201).result("Desktop updated successfully");
		} catch (MissingRequiredParametersException | BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (DeviceNotFoundException e) {
			ctx.status(404).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/laptop/{id}",
		methods = {HttpMethod.PUT},
		tags = {"Devices"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Updates a laptop in the database",
		description = "Updates a laptop with the specified ID and attributes",
		pathParams = {@OpenApiParam(
			name = "id",
			description = "The asset ID of the laptop to update"),},
		requestBody = @OpenApiRequestBody(
			required = true,
			content = {@OpenApiContent(
				from = InsertLaptopRequest.class,
				example = """
					{
					  "chapterId": 1,
					  "manufacturer": "Dell",
					  "model": "Optiplex 7010",
					  "year": 2022,
					  "status": "Not Started",
					  "includesCharger": "Included",
					  "assetId": 10000,
					  "cpu": null,
					  "ram": null,
					  "ramGeneration": null,
					  "storageAmount": null,
					  "storageType": null,
					  "value": null,
					  "acquisitionDate": null,
					  "recipientId": null,
					  "donorId": null,
					  "designBatteryCapacity": null,
					  "actualBatteryCapacity": null
					}""")}),
		responses = {@OpenApiResponse(
			status = "201",
			description = "Laptop updated successfully"),
				@OpenApiResponse(
					status = "400",
					description = "Missing required parameters or invalid field values"),
				@OpenApiResponse(
					status = "401",
					description = "Laptop with specified ID does not exist"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void updateLaptop(Context ctx) {
		InsertLaptopRequest request = ctx.bodyAsClass(InsertLaptopRequest.class);

		try {
			AuthController.requireChapterEditAccess(ctx, request.chapterId());
			service.updateLaptop(request, ctx.attribute("username"));
			ctx.status(200).result("Laptop updated successfully");
		} catch (MissingRequiredParametersException | BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (DeviceNotFoundException e) {
			ctx.status(404).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/tablet/{id}",
		methods = {HttpMethod.PUT},
		tags = {"Devices"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Updates a tablet in the database",
		description = "Updates a tablet with the specified ID and attributes",
		pathParams = {@OpenApiParam(
			name = "id",
			description = "The asset ID of the tablet to update"),},
		requestBody = @OpenApiRequestBody(
			required = true,
			content = {@OpenApiContent(
				from = InsertTabletRequest.class,
				example = """
					{
					  "chapterId": 1,
					  "manufacturer": "Dell",
					  "model": "Optiplex 7010",
					  "year": 2022,
					  "status": "Not Started",
					  "includesCharger": "Included",
					  "assetId": 10000,
					  "cpu": null,
					  "ram": null,
					  "ramGeneration": null,
					  "storageAmount": null,
					  "storageType": null,
					  "value": null,
					  "acquisitionDate": null,
					  "recipientId": null,
					  "donorId": null,
					  "workingBattery": "Yes"
					}""")}),
		responses = {@OpenApiResponse(
			status = "201",
			description = "Tablet updated successfully"),
				@OpenApiResponse(
					status = "400",
					description = "Missing required parameters or invalid field values"),
				@OpenApiResponse(
					status = "401",
					description = "Tablet with specified ID does not exist"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void updateTablet(Context ctx) {
		InsertTabletRequest request = ctx.bodyAsClass(InsertTabletRequest.class);

		try {
			AuthController.requireChapterEditAccess(ctx, request.chapterId());
			service.updateTablet(request, ctx.attribute("username"));
			ctx.status(200).result("Tablet updated successfully");
		} catch (MissingRequiredParametersException | BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (DeviceNotFoundException e) {
			ctx.status(404).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

	@OpenApi(
		path = "/api/devices/{id}/changelog",
		methods = {HttpMethod.GET},
		tags = {"Devices"},
		security = {@OpenApiSecurity(
			name = "BearerAuth")},
		summary = "Get the service history for a device",
		pathParams = {@OpenApiParam(
			name = "id",
			required = true,
			description = "Device ID for which to retrieve changelog")},
		responses = {@OpenApiResponse(
			status = "200",
			description = "Changelog fetched successfully",
			content = {@OpenApiContent(
				from = DeviceChangelogResponse[].class)}), @OpenApiResponse(
					status = "400",
					description = "Non-positive or non-numeric ID provided"),
				@OpenApiResponse(
					status = "404",
					description = "Device not found"),
				@OpenApiResponse(
					status = "500",
					description = "Database error")})
	public static void getDeviceChangelog(Context ctx) {
		try {
			List<Integer> userChapterIds = ctx.attribute("chapterIds");
			int deviceID = Integer.parseInt(ctx.pathParam("id"));
			DeviceChangelogResponse[] changelog = service.getDeviceChangelog(userChapterIds, deviceID);
			ctx.status(200).json(changelog);
		} catch (NumberFormatException e) {
			ctx.status(400).result("Device ID must be a positive integer");
		} catch (MissingRequiredParametersException e) {
			ctx.status(400).result(e.getMessage());
		} catch (InvalidParameterException e) {
			ctx.status(404).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}
}
