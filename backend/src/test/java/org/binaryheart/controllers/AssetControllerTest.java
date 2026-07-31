package org.binaryheart.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import io.javalin.Javalin;
import io.javalin.http.Context;
import java.sql.SQLException;
import org.binaryheart.services.AssetService;
import org.junit.jupiter.api.Test;

class AssetControllerTest {

	@Test
	void registerRoutesDefinesEndpoints() {
		AssetService service = mock(AssetService.class);
		replay(service);

		assertDoesNotThrow(
			() -> Javalin.create(config -> config.routes.apiBuilder(new AssetController(service)::registerRoutes)));

		verify(service);
	}

	@Test
	void rejectsMalformedIdWithoutCallingService() {
		AssetService service = mock(AssetService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("bad");
		expectResult(context, 400, "Invalid ID format");
		replay(service, context);

		new AssetController(service).assetExists(context);

		verify(service, context);
	}

	@Test
	void delegatesValidIdAndMapsDatabaseFailure() throws Exception {
		AssetService service = mock(AssetService.class);
		Context success = mock(Context.class);
		Context failure = mock(Context.class);
		expect(success.pathParam("id")).andReturn("42");
		expect(service.assetExists(42)).andReturn(true);
		expectJson(success, 200, true);
		expect(failure.pathParam("id")).andReturn("43");
		expect(service.assetExists(43)).andThrow(new SQLException("down"));
		expectResult(failure, 500, "Database error: down");
		replay(service, success, failure);

		AssetController controller = new AssetController(service);
		controller.assetExists(success);
		controller.assetExists(failure);

		verify(service, success, failure);
	}

	private void expectResult(Context context, int status, String result) {
		expect(context.status(status)).andReturn(context);
		expect(context.result(result)).andReturn(context);
	}

	private void expectJson(Context context, int status, Object body) {
		expect(context.status(status)).andReturn(context);
		expect(context.json(body)).andReturn(context);
	}
}