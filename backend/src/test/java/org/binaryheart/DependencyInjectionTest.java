package org.binaryheart;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;

import com.google.inject.Guice;
import com.google.inject.Injector;
import org.binaryheart.auth.JwtAccessManager;
import org.binaryheart.auth.CentralAuthConfig;
import org.binaryheart.auth.CentralTokenVerifier;
import org.binaryheart.jobs.chapters.ChapterSyncConfig;
import org.binaryheart.jobs.chapters.ChapterDirectoryClient;
import org.binaryheart.jobs.chapters.ChapterSyncRepository;
import org.binaryheart.jobs.chapters.ChapterSyncJob;
import org.binaryheart.controllers.AssetController;
import org.binaryheart.controllers.AuthController;
import org.binaryheart.controllers.ChapterController;
import org.binaryheart.controllers.DeviceController;
import org.binaryheart.controllers.HealthController;
import org.binaryheart.controllers.LookupController;
import org.binaryheart.controllers.MiscController;
import org.binaryheart.controllers.NoteController;
import org.binaryheart.controllers.PartController;
import org.binaryheart.controllers.PartyController;
import org.binaryheart.controllers.ToolController;
import org.binaryheart.jobs.stuckdevices.StuckDeviceJob;
import org.binaryheart.jobs.stuckdevices.StuckDeviceJobConfig;
import org.binaryheart.jobs.stuckdevices.StuckDeviceJobRepository;
import org.binaryheart.jobs.stuckdevices.StuckDeviceJobScheduler;
import org.binaryheart.repositories.AssetRepository;
import org.binaryheart.repositories.ChapterRepository;
import org.binaryheart.repositories.DeviceRepository;
import org.binaryheart.repositories.HealthRepository;
import org.binaryheart.repositories.LookupRepository;
import org.binaryheart.repositories.MiscRepository;
import org.binaryheart.repositories.NoteRepository;
import org.binaryheart.repositories.PartRepository;
import org.binaryheart.repositories.PartyRepository;
import org.binaryheart.repositories.ToolRepository;
import org.binaryheart.services.AssetService;
import org.binaryheart.services.AuthorizationService;
import org.binaryheart.services.ChapterService;
import org.binaryheart.services.DeviceService;
import org.binaryheart.services.HealthService;
import org.binaryheart.services.LookupService;
import org.binaryheart.services.MiscService;
import org.binaryheart.services.NoteService;
import org.binaryheart.services.PartService;
import org.binaryheart.services.PartyService;
import org.binaryheart.services.ToolService;
import org.junit.jupiter.api.Test;

class DependencyInjectionTest {

	@Test
	void applicationModuleConstructsEveryComponentAsSingleton() {
		Injector injector = Guice.createInjector(new ApplicationModule());
		Class<?>[] types = {AssetController.class, AuthController.class, ChapterController.class,
				DeviceController.class, HealthController.class, LookupController.class, MiscController.class,
				NoteController.class, PartController.class, PartyController.class, ToolController.class,
				AssetService.class, AuthorizationService.class, ChapterService.class, DeviceService.class,
				HealthService.class, LookupService.class, MiscService.class, NoteService.class, PartService.class,
				PartyService.class, ToolService.class, AssetRepository.class, ChapterRepository.class,
				DeviceRepository.class, HealthRepository.class, LookupRepository.class, MiscRepository.class,
				NoteRepository.class, PartRepository.class, PartyRepository.class, ToolRepository.class,
				JwtAccessManager.class, CentralAuthConfig.class, CentralTokenVerifier.class, StuckDeviceJobConfig.class,
				StuckDeviceJobRepository.class, StuckDeviceJob.class, StuckDeviceJobScheduler.class,
				ChapterSyncConfig.class, ChapterDirectoryClient.class, ChapterSyncRepository.class,
				ChapterSyncJob.class};

		for (Class<?> type : types) {
			Object instance = injector.getInstance(type);
			assertNotNull(instance, type.getSimpleName());
			assertSame(instance, injector.getInstance(type), type.getSimpleName());
		}
	}
}
