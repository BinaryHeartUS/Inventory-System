package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;

import org.binaryheart.services.DeviceCountService;

import java.sql.SQLException;

import static io.javalin.apibuilder.ApiBuilder.get;

public class DeviceCountController {

    private static final DeviceCountService service = new DeviceCountService();

    public static void registerRoutes() {
        // get("/laptops/count", DeviceController::getNumberOfLaptops);
        get("/desktops/count", DeviceCountController::getNumberOfDesktops);
        // get("/tablets/count", DeviceController::getNumberOfTablets);
        // get("/ready-to-donate/count", DeviceController::getNumberOfReadyToDonate);
        // get("/ready-to-donate/laptops/count",
        // DeviceController::getNumberOfReadyToDonateLaptops);
        // get("/ready-to-donate/tablets/count",
        // DeviceController::getNumberOfReadyToDonateTablets);
        // get("/ready-to-donate/desktops/count",
        // DeviceController::getNumberOfReadyToDonateDesktops);
        // get("/donated/count", DeviceController::getNumberOfDonated);
        // get("/donated/laptops/count", DeviceController::getNumberOfDonatedLaptops);
        // get("/donated/tablets/count", DeviceController::getNumberOfDonatedTablets);
        // get("/donated/desktops/count", DeviceController::getNumberOfDonatedDesktops);
    }

    @OpenApi(
            path = "api/devices/desktops/count",
            methods = { HttpMethod.GET },
            tags = { "Count Devices" },
            summary = "Retrieve the number of desktops currently in inventory",
            description = "Retrieves the number of desktops in inventory.",
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Data retrieved successfully"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void getNumberOfDesktops(Context ctx) {
        try {
            ctx.status(200).json(service.getNumberOfDesktops());
        } catch (SQLException e) {
            ctx.status(500).result("Database error");
        }
    }
}
