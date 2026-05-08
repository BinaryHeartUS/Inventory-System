package org.binaryheart;

import static io.javalin.apibuilder.ApiBuilder.path;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;

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
import org.binaryheart.controllers.ToolController;
import org.binaryheart.models.ChapterRole;
import org.binaryheart.requests.CreateAccountRequest;
import org.binaryheart.services.AccountService;
import org.binaryheart.services.ChapterService;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;
import io.javalin.openapi.plugin.OpenApiPlugin;
import io.javalin.openapi.plugin.swagger.SwaggerPlugin;

public class Main {
    private static final ChapterService chapterService = new ChapterService();

    public static void main(String[] args) {
        // AccountService serv = new AccountService();
        // try {
        // serv.createAccount(
        // new CreateAccountRequest("Developer", "developer", "mjy0XYJ6jyd_ufx3hxe",
        // chapterService.getNationalChapterId(), "Admin"),
        // "Admin",
        // new ArrayList<>(Arrays.asList(new
        // ChapterRole(chapterService.getNationalChapterId(), "Admin"))));

        // System.out.println("added developer");
        // } catch (SQLException e) {
        // e.printStackTrace();
        // }

        Javalin.create(config -> {
            config.jsonMapper(new JavalinJackson().updateMapper(mapper -> mapper.registerModule(new JavaTimeModule())
                    .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)));
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
                path("/api/accounts", AccountController::registerRoutes);
                path("/api/chapters", ChapterController::registerRoutes);
                path("/api/lookup", LookupController::registerRoutes);
                path("/api/assets", () -> {
                    AssetController.registerRoutes();
                    NoteController.registerRoutes();
                });
                path("/api/parts", PartController::registerRoutes);
                path("/api/tools", ToolController::registerRoutes);
            });
        }).start(8080);
    }
}