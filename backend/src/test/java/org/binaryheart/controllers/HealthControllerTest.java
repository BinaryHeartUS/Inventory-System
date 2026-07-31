package org.binaryheart.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import io.javalin.Javalin;
import io.javalin.http.Context;
import org.binaryheart.services.HealthService;
import org.junit.jupiter.api.Test;

class HealthControllerTest {

	@Test
	void registerRoutesDefinesEndpoints() {
		HealthService service = mock(HealthService.class);
		replay(service);

		assertDoesNotThrow(
			() -> Javalin.create(config -> config.routes.apiBuilder(new HealthController(service)::registerRoutes)));

		verify(service);
	}

	@Test
	void delegatesBothEndpoints() {
		HealthService service = mock(HealthService.class);
		Context healthContext = mock(Context.class);
		Context pingContext = mock(Context.class);
		expect(service.health()).andReturn("OK");
		expect(service.ping()).andReturn("pong");
		expect(healthContext.result("OK")).andReturn(healthContext);
		expect(pingContext.result("pong")).andReturn(pingContext);
		replay(service, healthContext, pingContext);

		HealthController controller = new HealthController(service);
		controller.health(healthContext);
		controller.ping(pingContext);

		verify(service, healthContext, pingContext);
	}
}