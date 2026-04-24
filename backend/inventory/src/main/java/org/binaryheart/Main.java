package org.binaryheart;

import static io.javalin.apibuilder.ApiBuilder.path;

import org.binaryheart.auth.JwtAccessManager;
import org.binaryheart.controllers.AuthController;
import org.binaryheart.controllers.DeviceController;
import org.binaryheart.controllers.HealthController;

import io.javalin.Javalin;
import io.javalin.openapi.plugin.OpenApiPlugin;
import io.javalin.openapi.plugin.swagger.SwaggerPlugin;

public class Main {
    public static void main(String[] args) {
        Javalin.create(config -> {
            config.registerPlugin(
                    new OpenApiPlugin(openapi -> openapi.withDefinitionConfiguration((version, builder) -> {
                        builder.info(info -> {
                            info.title("Inventory API");
                            info.version("1.0");
                        });
                        builder.withBearerAuth();
                    })));
            config.registerPlugin(new SwaggerPlugin());
            config.routes.beforeMatched(JwtAccessManager::handle);
            config.routes.apiBuilder(() -> {
                path("/api", HealthController::registerRoutes);
                path("/api/devices", DeviceController::registerRoutes);
                path("/api/auth", AuthController::registerRoutes);
            });
        }).start(8080);
    }
}