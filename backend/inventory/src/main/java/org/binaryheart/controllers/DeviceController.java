package org.binaryheart.controllers;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;
import static io.javalin.apibuilder.ApiBuilder.put;

import java.sql.SQLException;
import java.util.List;

import org.binaryheart.auth.AppRole;
import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DeviceNotFoundException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.requests.InsertDesktopRequest;
import org.binaryheart.requests.InsertLaptopRequest;
import org.binaryheart.requests.InsertTabletRequest;
import org.binaryheart.responses.GetDeviceResponse;
import org.binaryheart.services.ChapterService;
import org.binaryheart.services.DeviceService;

import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import io.javalin.openapi.HttpMethod;
import io.javalin.openapi.OpenApi;
import io.javalin.openapi.OpenApiContent;
import io.javalin.openapi.OpenApiParam;
import io.javalin.openapi.OpenApiRequestBody;
import io.javalin.openapi.OpenApiResponse;
import io.javalin.openapi.OpenApiSecurity;

public class DeviceController {

	private static final DeviceService service = new DeviceService();
	private static final ChapterService chapterService = new ChapterService();

	public static void registerRoutes() {
		get("/count/{type}", DeviceController::getDeviceCount, AppRole.AUTHENTICATED);
		get("/{id}", DeviceController::getDevice, AppRole.AUTHENTICATED);
		get("", DeviceController::getAllDevices, AppRole.AUTHENTICATED);
		post("/desktop", DeviceController::insertDesktop, AppRole.AUTHENTICATED);
		post("/laptop", DeviceController::insertLaptop, AppRole.AUTHENTICATED);
		post("/tablet", DeviceController::insertTablet, AppRole.AUTHENTICATED);
		put("/desktop/{id}", DeviceController::updateDesktop, AppRole.AUTHENTICATED);
		put("/laptop/{id}", DeviceController::updateLaptop, AppRole.AUTHENTICATED);
		put("/tablet/{id}", DeviceController::updateTablet, AppRole.AUTHENTICATED);
	}

	@OpenApi(
			path = "/api/devices/count/{type}",
			methods = { HttpMethod.GET },
			tags = { "Devices" },
			security = { @OpenApiSecurity(
					name = "BearerAuth") },
			summary = "Retrieve the number of devices of a given type",
			description = "Returns the count of devices by type (desktop, laptop, tablet). "
					+ "Optionally filter by status: 'ready-to-donate' or 'donated'. "
					+ "Omitting the status parameter returns the active inventory count.",
			pathParams = { @OpenApiParam(
					name = "type",
					description = "Device type: desktop, laptop, or tablet") },
			queryParams = { @OpenApiParam(
					name = "status",
					required = false,
					description = "Filter by status: ready-to-donate or donated") },
			responses = { @OpenApiResponse(
					status = "200",
					description = "Count retrieved successfully"),
					@OpenApiResponse(
							status = "400",
							description = "Invalid device type or status"),
					@OpenApiResponse(
							status = "500",
							description = "Database error") })
	public static void getDeviceCount(Context ctx) {
		String type = ctx.pathParam("type").toLowerCase();
		String status = ctx.queryParam("status") == null ? "active" : ctx.queryParam("status").toLowerCase();

		try {
			int count = service.getDeviceCount(type, status);
			ctx.status(200).json(count);
		} catch (BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error");
		}
	}

	@OpenApi(
			path = "/api/devices/{id}",
			methods = { HttpMethod.GET },
			tags = { "Devices" },
			security = { @OpenApiSecurity(
					name = "BearerAuth") },
			summary = "Retrieve a device with a specific ID",
			description = "Returns the device with the given ID.",
			pathParams = { @OpenApiParam(
					name = "id",
					description = "Device ID: A unique number assigned to each device") },
			responses = { @OpenApiResponse(
					status = "200",
					description = "Device retrieved successfully",
					content = { @OpenApiContent(
							from = GetDeviceResponse.class) }),
					@OpenApiResponse(
							status = "400",
							description = "Non-numeric or non-positive device ID"),
					@OpenApiResponse(
							status = "404",
							description = "ID does not match any existing devices"),
					@OpenApiResponse(
							status = "500",
							description = "Database error") })
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
			ctx.status(500).result("Database error");
		}
	}

	@OpenApi(
			path = "/api/devices",
			methods = { HttpMethod.GET },
			tags = { "Devices" },
			security = { @OpenApiSecurity(
					name = "BearerAuth") },
			summary = "Retrieve all devices",
			description = "Returns a list of all devices.",
			responses = { @OpenApiResponse(
					status = "200",
					description = "Devices retrieved successfully",
					content = { @OpenApiContent(
							from = GetDeviceResponse[].class) }),
					@OpenApiResponse(
							status = "500",
							description = "Database error") })
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
			methods = { HttpMethod.POST },
			tags = { "Devices" },
			security = { @OpenApiSecurity(
					name = "BearerAuth") },
			summary = "Add a new desktop to the database",
			description = "Adds a desktop with the specified attributes",
			requestBody = @OpenApiRequestBody(
					required = true,
					content = { @OpenApiContent(
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
									}""") }),
			responses = { @OpenApiResponse(
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
							description = "Database error") })
	public static void insertDesktop(Context ctx) {
		InsertDesktopRequest request = ctx.bodyAsClass(InsertDesktopRequest.class);

		try {
			AuthController.requireChapterEditAccess(ctx, request.chapterId());
			service.insertDesktop(request);
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
			methods = { HttpMethod.POST },
			tags = { "Devices" },
			security = { @OpenApiSecurity(
					name = "BearerAuth") },
			summary = "Add a new laptop to the database",
			description = "Adds a laptop with the specified attributes",
			requestBody = @OpenApiRequestBody(
					required = true,
					content = { @OpenApiContent(
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
									}""") }),
			responses = { @OpenApiResponse(
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
							description = "Database error") })
	public static void insertLaptop(Context ctx) {
		InsertLaptopRequest request = ctx.bodyAsClass(InsertLaptopRequest.class);

		try {
			AuthController.requireChapterEditAccess(ctx, request.chapterId());
			service.insertLaptop(request);
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
			methods = { HttpMethod.POST },
			tags = { "Devices" },
			security = { @OpenApiSecurity(
					name = "BearerAuth") },
			summary = "Add a new tablet to the database",
			description = "Adds a tablet with the specified attributes",
			requestBody = @OpenApiRequestBody(
					required = true,
					content = { @OpenApiContent(
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
									}""") }),
			responses = { @OpenApiResponse(
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
							description = "Database error") })
	public static void insertTablet(Context ctx) {
		InsertTabletRequest request = ctx.bodyAsClass(InsertTabletRequest.class);

		try {
			AuthController.requireChapterEditAccess(ctx, request.chapterId());
			service.insertTablet(request);
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
			methods = { HttpMethod.PUT },
			tags = { "Devices" },
			security = { @OpenApiSecurity(
					name = "BearerAuth") },
			summary = "Updates a desktop in the database",
			description = "Updates a desktop with the specified ID and attributes",
			pathParams = { @OpenApiParam(
					name = "id",
					description = "The asset ID of the desktop to update"), },
			requestBody = @OpenApiRequestBody(
					required = true,
					content = { @OpenApiContent(
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
									}""") }),
			responses = { @OpenApiResponse(
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
							description = "Database error") })
	public static void updateDesktop(Context ctx) {
		InsertDesktopRequest request = ctx.bodyAsClass(InsertDesktopRequest.class);

		try {
			AuthController.requireChapterEditAccess(ctx, request.chapterId());
			service.updateDesktop(request);
			ctx.status(200).result("Desktop updated successfully");
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
			methods = { HttpMethod.PUT },
			tags = { "Devices" },
			security = { @OpenApiSecurity(
					name = "BearerAuth") },
			summary = "Updates a laptop in the database",
			description = "Updates a laptop with the specified ID and attributes",
			pathParams = { @OpenApiParam(
					name = "id",
					description = "The asset ID of the laptop to update"), },
			requestBody = @OpenApiRequestBody(
					required = true,
					content = { @OpenApiContent(
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
									}""") }),
			responses = { @OpenApiResponse(
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
							description = "Database error") })
	public static void updateLaptop(Context ctx) {
		InsertLaptopRequest request = ctx.bodyAsClass(InsertLaptopRequest.class);

		try {
			AuthController.requireChapterEditAccess(ctx, request.chapterId());
			service.updateLaptop(request);
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
			methods = { HttpMethod.PUT },
			tags = { "Devices" },
			security = { @OpenApiSecurity(
					name = "BearerAuth") },
			summary = "Updates a tablet in the database",
			description = "Updates a tablet with the specified ID and attributes",
			pathParams = { @OpenApiParam(
					name = "id",
					description = "The asset ID of the tablet to update"), },
			requestBody = @OpenApiRequestBody(
					required = true,
					content = { @OpenApiContent(
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
									}""") }),
			responses = { @OpenApiResponse(
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
							description = "Database error") })
	public static void updateTablet(Context ctx) {
		InsertTabletRequest request = ctx.bodyAsClass(InsertTabletRequest.class);

		try {
			AuthController.requireChapterEditAccess(ctx, request.chapterId());
			service.updateTablet(request);
			ctx.status(200).result("Tablet updated successfully");
		} catch (MissingRequiredParametersException | BadArgumentException e) {
			ctx.status(400).result(e.getMessage());
		} catch (DeviceNotFoundException e) {
			ctx.status(404).result(e.getMessage());
		} catch (SQLException e) {
			ctx.status(500).result("Database error: " + e.getMessage());
		}
	}

}
