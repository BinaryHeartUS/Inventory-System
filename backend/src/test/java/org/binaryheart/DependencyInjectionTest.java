package org.binaryheart;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.google.inject.Guice;
import com.google.inject.Injector;
import org.binaryheart.auth.EncryptionHelper;
import org.binaryheart.auth.JwtAccessManager;
import org.binaryheart.auth.JwtService;
import org.binaryheart.auth.PasswordService;
import org.binaryheart.auth.TokenService;
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
import org.binaryheart.services.AccountService;
import org.binaryheart.services.AssetService;
import org.binaryheart.services.AuthService;
import org.binaryheart.services.AuthorizationService;
import org.binaryheart.services.ChapterService;
import org.binaryheart.services.DeviceService;
import org.binaryheart.services.HealthService;
import org.binaryheart.services.LookupService;
import org.binaryheart.services.NoteService;
import org.binaryheart.services.PartService;
import org.binaryheart.services.PartyService;
import org.binaryheart.services.ToolService;
import org.junit.jupiter.api.Test;

class DependencyInjectionTest {

	@Test
	void guiceConstructsEveryControllerAndService() {
		Injector injector = Guice.createInjector();
		Class<?>[] types = {AccountController.class, AssetController.class, AuthController.class,
				ChapterController.class, DeviceController.class, HealthController.class, LookupController.class,
				NoteController.class, PartController.class, PartyController.class, ToolController.class,
				AccountService.class, AssetService.class, AuthService.class, AuthorizationService.class,
				ChapterService.class, DeviceService.class, HealthService.class, LookupService.class, NoteService.class,
				PartService.class, PartyService.class, ToolService.class, EncryptionHelper.class,
				JwtAccessManager.class, JwtService.class, PasswordService.class, TokenService.class};

		for (Class<?> type : types) {
			assertNotNull(injector.getInstance(type), type.getSimpleName());
		}
	}
}
