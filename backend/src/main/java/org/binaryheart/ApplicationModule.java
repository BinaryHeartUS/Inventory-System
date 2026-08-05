package org.binaryheart;

import com.google.inject.AbstractModule;
import com.google.inject.Scopes;
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
import org.binaryheart.jobs.stuckdevices.StuckDeviceJob;
import org.binaryheart.jobs.stuckdevices.StuckDeviceJobConfig;
import org.binaryheart.jobs.stuckdevices.StuckDeviceJobRepository;
import org.binaryheart.jobs.stuckdevices.StuckDeviceJobScheduler;
import org.binaryheart.repositories.AccountRepository;
import org.binaryheart.repositories.AssetRepository;
import org.binaryheart.repositories.AuthRepository;
import org.binaryheart.repositories.ChapterRepository;
import org.binaryheart.repositories.DeviceRepository;
import org.binaryheart.repositories.HealthRepository;
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

public class ApplicationModule extends AbstractModule {

	@Override
	protected void configure() {
		binder().requireExplicitBindings();

		bindSingleton(AccountController.class);
		bindSingleton(AssetController.class);
		bindSingleton(AuthController.class);
		bindSingleton(ChapterController.class);
		bindSingleton(DeviceController.class);
		bindSingleton(HealthController.class);
		bindSingleton(LookupController.class);
		bindSingleton(NoteController.class);
		bindSingleton(PartController.class);
		bindSingleton(PartyController.class);
		bindSingleton(ToolController.class);

		bindSingleton(AccountService.class);
		bindSingleton(AssetService.class);
		bindSingleton(AuthenticationService.class);
		bindSingleton(AuthorizationService.class);
		bindSingleton(ChapterService.class);
		bindSingleton(DeviceService.class);
		bindSingleton(HealthService.class);
		bindSingleton(LookupService.class);
		bindSingleton(NoteService.class);
		bindSingleton(PartService.class);
		bindSingleton(PartyService.class);
		bindSingleton(ToolService.class);

		bindSingleton(AccountRepository.class);
		bindSingleton(AssetRepository.class);
		bindSingleton(AuthRepository.class);
		bindSingleton(ChapterRepository.class);
		bindSingleton(DeviceRepository.class);
		bindSingleton(HealthRepository.class);
		bindSingleton(LookupRepository.class);
		bindSingleton(NoteRepository.class);
		bindSingleton(PartRepository.class);
		bindSingleton(PartyRepository.class);
		bindSingleton(ToolRepository.class);

		bind(StuckDeviceJobConfig.class).toInstance(StuckDeviceJobConfig.fromEnvironment());
		bindSingleton(StuckDeviceJobRepository.class);
		bindSingleton(StuckDeviceJob.class);
		bindSingleton(StuckDeviceJobScheduler.class);

		bindSingleton(EncryptionHelper.class);
		bindSingleton(JwtAccessManager.class);
		bindSingleton(JwtService.class);
		bindSingleton(PasswordService.class);
		bindSingleton(TokenService.class);
	}

	private <T> void bindSingleton(Class<T> type) {
		bind(type).in(Scopes.SINGLETON);
	}
}