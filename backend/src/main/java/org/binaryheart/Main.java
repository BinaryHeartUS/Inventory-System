package org.binaryheart;

import static io.javalin.apibuilder.ApiBuilder.path;

import com.google.inject.Guice;
import com.google.inject.Injector;
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
		Injector injector = Guice.createInjector();
		AccountController accountController = injector.getInstance(AccountController.class);
		AssetController assetController = injector.getInstance(AssetController.class);
		AuthController authController = injector.getInstance(AuthController.class);
		ChapterController chapterController = injector.getInstance(ChapterController.class);
		DeviceController deviceController = injector.getInstance(DeviceController.class);
		HealthController healthController = injector.getInstance(HealthController.class);
		LookupController lookupController = injector.getInstance(LookupController.class);
		NoteController noteController = injector.getInstance(NoteController.class);
		PartController partController = injector.getInstance(PartController.class);
		PartyController partyController = injector.getInstance(PartyController.class);
		ToolController toolController = injector.getInstance(ToolController.class);
		JwtAccessManager accessManager = injector.getInstance(JwtAccessManager.class);

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
			config.routes.beforeMatched(accessManager::handle);
			config.routes.apiBuilder(() -> {
				path("/api", healthController::registerRoutes);
				path("/api/devices", deviceController::registerRoutes);
				path("/api/auth", authController::registerRoutes);
				path("/api/accounts", accountController::registerRoutes);
				path("/api/chapters", chapterController::registerRoutes);
				path("/api/lookup", lookupController::registerRoutes);
				path("/api/assets", () -> {
					assetController.registerRoutes();
					noteController.registerRoutes();
				});
				path("/api/parts", partController::registerRoutes);
				path("/api/tools", toolController::registerRoutes);
				path("/api/party", partyController::registerRoutes);
			});
		}).start(8080);
	}
}
