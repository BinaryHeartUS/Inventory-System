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
	void liveDelegates() {
		HealthService service = mock(HealthService.class);
		Context context = mock(Context.class);
		expect(service.live()).andReturn("OK");
		expect(context.result("OK")).andReturn(context);
		replay(service, context);

		new HealthController(service).live(context);

		verify(service, context);
	}

	@Test
	void readyDelegates() throws Exception {
		HealthService service = mock(HealthService.class);
		Context context = mock(Context.class);
		expect(service.ready()).andReturn("OK");
		expect(context.result("OK")).andReturn(context);
		replay(service, context);

		new HealthController(service).ready(context);

		verify(service, context);
	}

	@Test
	void readyReturnsServiceUnavailableWhenDatabaseCheckFails() throws Exception {
		HealthService service = mock(HealthService.class);
		Context context = mock(Context.class);
		expect(service.ready()).andThrow(new java.sql.SQLException("unavailable"));
		expect(context.status(503)).andReturn(context);
		expect(context.result("Database unavailable")).andReturn(context);
		replay(service, context);

		new HealthController(service).ready(context);

		verify(service, context);
	}
}