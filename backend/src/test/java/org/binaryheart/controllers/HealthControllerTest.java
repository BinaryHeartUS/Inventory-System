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
	void healthDelegates() {
		HealthService service = mock(HealthService.class);
		Context context = mock(Context.class);
		expect(service.health()).andReturn("OK");
		expect(context.result("OK")).andReturn(context);
		replay(service, context);

		new HealthController(service).health(context);

		verify(service, context);
	}

	@Test
	void pingDelegates() {
		HealthService service = mock(HealthService.class);
		Context context = mock(Context.class);
		expect(service.ping()).andReturn("pong");
		expect(context.result("pong")).andReturn(context);
		replay(service, context);

		new HealthController(service).ping(context);

		verify(service, context);
	}
}