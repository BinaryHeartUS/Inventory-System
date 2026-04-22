package org.binaryheart;

import io.javalin.Javalin;
import io.javalin.openapi.plugin.OpenApiPlugin;
import io.javalin.openapi.plugin.swagger.SwaggerPlugin;

import org.binaryheart.controllers.DeviceController;
import org.binaryheart.controllers.HealthController;

import static io.javalin.apibuilder.ApiBuilder.path;

public class Main {
    public static void main(String[] args) {
        Javalin.create(config -> {
            config.registerPlugin(new OpenApiPlugin(
                    openapi -> openapi.withDefinitionConfiguration((version, builder) -> builder.info(info -> {
                        info.title("Inventory API");
                        info.version("1.0");
                    }))));
            config.registerPlugin(new SwaggerPlugin());
            config.routes.apiBuilder(() -> {
                path("/api", HealthController::registerRoutes);
                path("/api/devices", DeviceController::registerRoutes);
            });
        }).start(8080);
    }
}