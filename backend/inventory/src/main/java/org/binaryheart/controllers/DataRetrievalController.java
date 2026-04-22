package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;

import org.binaryheart.services.DataRetrievalService;

import java.sql.SQLException;

import static io.javalin.apibuilder.ApiBuilder.get;

public class DataRetrievalController {

    private static final DataRetrievalService service = new DataRetrievalService();

    public static void registerRoutes() {
        get("/getData", DataRetrievalController::getData);
    }

    @OpenApi(
            path = "/tables/getData",
            methods = { HttpMethod.GET },
            tags = { "Tables" },
            summary = "Retrieve data from a table",
            description = "Retrieves data from a specified table.",
            queryParams = { @OpenApiParam(
                    name = "tableName",
                    required = true,
                    description = "Name of the table to retrieve data from") },
            responses = { @OpenApiResponse(
                    status = "200",
                    description = "Data retrieved successfully"),
                    @OpenApiResponse(
                            status = "400",
                            description = "Missing or invalid parameters"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void getData(Context ctx) {
        String tableName = ctx.queryParam("tableName");

        if (tableName == null || tableName.isBlank()) {
            ctx.status(400).result("tableName is required");
            return;
        }

        try {
            ctx.status(200).result("The columns in table '" + tableName + "' are: "
                    + String.join(", ", service.getColumnNames(tableName)));
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }
}
