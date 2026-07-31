package org.binaryheart;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;

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
import org.binaryheart.repositories.AccountRepository;
import org.binaryheart.repositories.AssetRepository;
import org.binaryheart.repositories.AuthRepository;
import org.binaryheart.repositories.ChapterRepository;
import org.binaryheart.repositories.DeviceRepository;
import org.binaryheart.repositories.LookupRepository;
import org.binaryheart.repositories.NoteRepository;
import org.binaryheart.repositories.PartRepository;
import org.binaryheart.repositories.PartyRepository;
import org.binaryheart.repositories.ToolRepository;
import org.binaryheart.services.AccountService;
import org.binaryheart.services.AssetService;
import org.binaryheart.services.AuthenticationService;
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
	void applicationModuleConstructsEveryComponentAsSingleton() {
		Injector injector = Guice.createInjector(new ApplicationModule());
		Class<?>[] types = {AccountController.class, AssetController.class, AuthController.class,
				ChapterController.class, DeviceController.class, HealthController.class, LookupController.class,
				NoteController.class, PartController.class, PartyController.class, ToolController.class,
				AccountService.class, AssetService.class, AuthenticationService.class, AuthorizationService.class,
				ChapterService.class, DeviceService.class, HealthService.class, LookupService.class, NoteService.class,
				PartService.class, PartyService.class, ToolService.class, AccountRepository.class,
				AssetRepository.class, AuthRepository.class, ChapterRepository.class, DeviceRepository.class,
				LookupRepository.class, NoteRepository.class, PartRepository.class, PartyRepository.class,
				ToolRepository.class, EncryptionHelper.class, JwtAccessManager.class, JwtService.class,
				PasswordService.class, TokenService.class};

		for (Class<?> type : types) {
			Object instance = injector.getInstance(type);
			assertNotNull(instance, type.getSimpleName());
			assertSame(instance, injector.getInstance(type), type.getSimpleName());
		}
	}
}
