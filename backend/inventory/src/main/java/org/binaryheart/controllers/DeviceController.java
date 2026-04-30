package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import io.javalin.openapi.*;

import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DeviceNotFoundException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.auth.AppRole;
import org.binaryheart.requests.InsertDesktopRequest;
import org.binaryheart.requests.InsertLaptopRequest;
import org.binaryheart.responses.GetDeviceResponse;
import org.binaryheart.services.DeviceService;

import java.sql.SQLException;
import java.util.List;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;

public class DeviceController {

    private static final DeviceService service = new DeviceService();

    public static void registerRoutes() {
        get("/count/{type}", DeviceController::getDeviceCount, AppRole.AUTHENTICATED);
        get("/{id}", DeviceController::getDevice, AppRole.AUTHENTICATED);
        get("", DeviceController::getAllDevices, AppRole.AUTHENTICATED);
        post("/desktop", DeviceController::insertDesktop, AppRole.AUTHENTICATED);
        post("/laptop", DeviceController::insertLaptop, AppRole.AUTHENTICATED);
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
            GetDeviceResponse[] result = service.getAllDevices().toArray(new GetDeviceResponse[0]);
            ctx.status(200).json(result);
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
                                      "manufacturer": "DELL",
                                      "model": "Optiplex 7010",
                                      "year": 2022,
                                      "status": "NOT_STARTED",
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

        List<Integer> userChapters = ctx.attribute("chapterIds");
        if (userChapters == null || !userChapters.contains(request.chapterId())) {
            throw new ForbiddenResponse("You do not have access to this chapter.");
        }

        try {
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
                                      "manufacturer": "DELL",
                                      "model": "Optiplex 7010",
                                      "year": 2022,
                                      "status": "NOT_STARTED",
                                      "includesCharger": "INCLUDED",
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

        List<Integer> userChapters = ctx.attribute("chapterIds");
        if (userChapters == null || !userChapters.contains(request.chapterId())) {
            throw new ForbiddenResponse("You do not have access to this chapter.");
        }

        try {
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

}
