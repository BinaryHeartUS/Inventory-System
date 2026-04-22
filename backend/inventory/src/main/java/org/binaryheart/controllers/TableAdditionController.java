package org.binaryheart.controllers;

import io.javalin.http.Context;
import io.javalin.openapi.*;
import org.binaryheart.services.TableAdditionService;

import java.sql.SQLException;

import static io.javalin.apibuilder.ApiBuilder.post;

public class TableAdditionController {

    private static final TableAdditionService service = new TableAdditionService();

    public static void registerRoutes() {
        post("/addTable", TableAdditionController::addTable);
    }

    @OpenApi(
            path = "/tables/addTable",
            methods = { HttpMethod.POST },
            tags = { "Tables" },
            summary = "Create a new table",
            description = "Creates a new table with a single column.",
            queryParams = { @OpenApiParam(
                    name = "tableName",
                    required = true,
                    description = "Name of the table to create"),
                    @OpenApiParam(
                            name = "columnName",
                            required = true,
                            description = "Name of the primary key column") },
            responses = { @OpenApiResponse(
                    status = "201",
                    description = "Table created successfully"),
                    @OpenApiResponse(
                            status = "400",
                            description = "Missing or invalid parameters"),
                    @OpenApiResponse(
                            status = "500",
                            description = "Database error") })
    public static void addTable(Context ctx) {
        String tableName = ctx.queryParam("tableName");
        String columnName = ctx.queryParam("columnName");

        if (tableName == null || tableName.isBlank()) {
            ctx.status(400).result("tableName is required");
            return;
        }
        if (columnName == null || columnName.isBlank()) {
            ctx.status(400).result("columnName is required");
            return;
        }

        try {
            service.addTable(tableName, columnName);
            ctx.status(201).result("Table '" + tableName + "' created");
        } catch (SQLException e) {
            ctx.status(500).result("Database error: " + e.getMessage());
        }
    }
}
