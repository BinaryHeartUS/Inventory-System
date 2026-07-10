package org.binaryheart;

import static io.javalin.apibuilder.ApiBuilder.path;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;
import io.javalin.openapi.plugin.OpenApiPlugin;
import io.javalin.openapi.plugin.swagger.SwaggerPlugin;
import org.binaryheart.auth.JwtAccessManager;
import org.binaryheart.controllers.AccountController;
import org.binaryheart.controllers.AssetController;
import org.binaryheart.controllers.AuthController;
import org.binaryheart.controllers.ChapterController;
import org.binaryheart.controllers.DeviceController;
import org.binaryheart.controllers.HealthController;
import org.binaryheart.controllers.LookupController;
import org.binaryheart.controllers.NoteController;
import org.binaryheart.controllers.PartController;
import org.binaryheart.controllers.PartyController;
import org.binaryheart.controllers.ToolController;

public class Main {
	public static void main(String[] args) {

		Javalin.create(config -> {
			config.jsonMapper(new JavalinJackson().updateMapper(mapper -> mapper.registerModule(new JavaTimeModule())
				.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)));
			config
				.registerPlugin(new OpenApiPlugin(openapi -> openapi.withDefinitionConfiguration((version, builder) -> {
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
				path("/api/accounts", AccountController::registerRoutes);
				path("/api/chapters", ChapterController::registerRoutes);
				path("/api/lookup", LookupController::registerRoutes);
				path("/api/assets", () -> {
					AssetController.registerRoutes();
					NoteController.registerRoutes();
				});
				path("/api/parts", PartController::registerRoutes);
				path("/api/tools", ToolController::registerRoutes);
				path("/api/party", PartyController::registerRoutes);
			});
		}).start(8080);
	}
}
