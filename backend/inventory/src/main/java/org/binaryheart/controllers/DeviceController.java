package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;

import org.binaryheart.Exceptions.DuplicateKeyException;
import org.binaryheart.requests.InsertDesktopRequest;
import org.binaryheart.services.DeviceService;

import java.sql.SQLException;

import static io.javalin.apibuilder.ApiBuilder.get;
import static io.javalin.apibuilder.ApiBuilder.post;

public class DeviceController {

    private static final DeviceService service = new DeviceService();

    public static void registerRoutes() {
        get("/count/{type}", DeviceController::getDeviceCount);
        post("/add/desktop", DeviceController::insertDesktop);
    }

    @OpenApi(
            path = "/api/devices/count/{type}",
            methods = { HttpMethod.GET },
            tags = { "Devices" },
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

        if (!type.equals("desktop") && !type.equals("laptop") && !type.equals("tablet")) {
            ctx.status(400).result("Unknown device type: " + type);
            return;
        }
        if (!status.equals("active") && !status.equals("ready-to-donate") && !status.equals("donated")) {
            ctx.status(400).result("Unknown status: " + status);
            return;
        }

        try {
            int count = switch (status + ":" + type) {
            case "active:desktop" -> service.getNumberOfDesktops();
            case "active:laptop" -> service.getNumberOfLaptops();
            case "active:tablet" -> service.getNumberOfTablets();
            case "ready-to-donate:desktop" -> service.getNumberOfReadyToDonateDesktops();
            case "ready-to-donate:laptop" -> service.getNumberOfReadyToDonateLaptops();
            case "ready-to-donate:tablet" -> service.getNumberOfReadyToDonateTablets();
            case "donated:desktop" -> service.getNumberOfDonatedDesktops();
            case "donated:laptop" -> service.getNumberOfDonatedLaptops();
            case "donated:tablet" -> service.getNumberOfDonatedTablets();
            default -> throw new IllegalStateException("Unhandled combination: " + status + ":" + type);
            };
            ctx.status(200).json(count);
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
        }
    }

    @OpenApi(
            path = "/api/devices/add/desktop",
            methods = { HttpMethod.POST },
            tags = { "Devices" },
            summary = "Add a new desktop device",
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
                                      "status": "NOT_STARTED"
                                    }""") }),
            responses = { @OpenApiResponse(
                    status = "201",
                    description = "Desktop added successfully"),
                    @OpenApiResponse(
                            status = "400",
                            description = "Missing required parameters"),
                    @OpenApiResponse(
                            status = "409",
                            description = "Asset ID already exists"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void insertDesktop(Context ctx) {
        InsertDesktopRequest request = ctx.bodyAsClass(InsertDesktopRequest.class);

        if (request.chapterId() == 0 || request.manufacturer() == null || request.model() == null || request.year() == 0
                || request.status() == null) {
            ctx.status(400).result("Missing required parameters");
            return;
        }
        if (request.ram() != null && request.ram() <= 0) {
            ctx.status(400).result("RAM amount must be positive or not specified");
            return;
        }
        if (request.storageAmount() != null && request.storageAmount() <= 0) {
            ctx.status(400).result("Storage amount must be positive or not specified");
            return;
        }
        if (request.value() != null && request.value() < 0) {
            ctx.status(400).result("Value must be non-negative or not specified");
            return;
        }
        if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
            ctx.status(400).result("Acquisition date cannot be in the future");
            return;
        }
        if (request.assetId() != null && request.assetId() <= 0) {
            ctx.status(400).result("Asset ID must be positive or not specified");
            return;
        }

        try {
            service.insertDesktop(request);
            ctx.status(201).result("Desktop added successfully");
        } catch (DuplicateKeyException e) {
            ctx.status(409).result(e.getMessage());
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }
}
