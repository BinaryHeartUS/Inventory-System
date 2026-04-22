package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;

import org.binaryheart.services.DeviceService;

import java.sql.SQLException;

import static io.javalin.apibuilder.ApiBuilder.get;

public class DeviceController {

    private static final DeviceService service = new DeviceService();

    public static void registerRoutes() {
        get("/count/{type}", DeviceController::getDeviceCount);
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
}
