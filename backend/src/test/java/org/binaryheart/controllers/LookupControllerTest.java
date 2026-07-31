package org.binaryheart.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import io.javalin.Javalin;
import io.javalin.http.Context;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.stream.Stream;
import org.binaryheart.requests.AddLookupRequest;
import org.binaryheart.responses.LookupResponse;
import org.binaryheart.services.LookupService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class LookupControllerTest {

	@Test
	void registerRoutesDefinesEndpoints() {
		LookupService service = mock(LookupService.class);
		replay(service);

		assertDoesNotThrow(
			() -> Javalin.create(config -> config.routes.apiBuilder(new LookupController(service)::registerRoutes)));

		verify(service);
	}

	@ParameterizedTest
	@MethodSource("invalidLookupNames")
	void everyInsertRejectsMissingName(BiConsumer<LookupController, Context> handler) {
		LookupService service = mock(LookupService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(AddLookupRequest.class)).andReturn(new AddLookupRequest(" "));
		expectResult(context, 400, "name is required");
		replay(service, context);

		handler.accept(new LookupController(service), context);

		verify(service, context);
	}

	@Test
	void insertAndDeleteDelegateAndMapForeignKeyConflict() throws Exception {
		LookupService service = mock(LookupService.class);
		Context add = mock(Context.class);
		Context delete = mock(Context.class);
		expect(add.bodyAsClass(AddLookupRequest.class)).andReturn(new AddLookupRequest("Dell"));
		service.addManufacturer("Dell");
		expectStatus(add, 201);
		expect(delete.pathParam("name")).andReturn("Dell");
		service.removeManufacturer("Dell");
		expectLastCall().andThrow(new java.sql.SQLException("in use", "23503"));
		expectResult(delete, 409, "Cannot delete \"Dell\" because it is still in use.");
		replay(service, add, delete);
		LookupController controller = new LookupController(service);

		controller.addManufacturer(add);
		controller.deleteManufacturer(delete);

		verify(service, add, delete);
	}

	@Test
	void getAllDelegates() throws Exception {
		LookupService service = mock(LookupService.class);
		Context context = mock(Context.class);
		LookupResponse response = new LookupResponse(List.of(), List.of(), List.of(), List.of(), List.of(), List.of(),
			List.of(), List.of());
		expect(service.getAll()).andReturn(response);
		expect(context.json(response)).andReturn(context);
		replay(service, context);

		new LookupController(service).getAll(context);

		verify(service, context);
	}

	private static Stream<Arguments> invalidLookupNames() {
		return Stream.of(Arguments.of((BiConsumer<LookupController, Context>) LookupController::addManufacturer),
			Arguments.of((BiConsumer<LookupController, Context>) LookupController::addRamGeneration),
			Arguments.of((BiConsumer<LookupController, Context>) LookupController::addStorageType),
			Arguments.of((BiConsumer<LookupController, Context>) LookupController::addPartType),
			Arguments.of((BiConsumer<LookupController, Context>) LookupController::addOperatingSystem));
	}

	private void expectStatus(Context context, int status) {
		expect(context.status(status)).andReturn(context);
	}

	private void expectResult(Context context, int status, String result) {
		expectStatus(context, status);
		expect(context.result(result)).andReturn(context);
	}
}