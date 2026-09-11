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
import org.binaryheart.requests.AddLookupRequest;
import org.binaryheart.responses.LookupResponse;
import org.binaryheart.services.LookupService;
import org.junit.jupiter.api.Test;

class LookupControllerTest {

	@Test
	void registerRoutesDefinesEndpoints() {
		LookupService service = mock(LookupService.class);
		replay(service);

		assertDoesNotThrow(
			() -> Javalin.create(config -> config.routes.apiBuilder(new LookupController(service)::registerRoutes)));

		verify(service);
	}

	@Test
	void addManufacturerRejectsMissingName() {
		LookupService service = mock(LookupService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(AddLookupRequest.class)).andReturn(new AddLookupRequest(" "));
		expectResult(context, 400, "name is required");
		replay(service, context);

		new LookupController(service).addManufacturer(context);

		verify(service, context);
	}

	@Test
	void addRamGenerationRejectsMissingName() {
		LookupService service = mock(LookupService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(AddLookupRequest.class)).andReturn(new AddLookupRequest(" "));
		expectResult(context, 400, "name is required");
		replay(service, context);

		new LookupController(service).addRamGeneration(context);

		verify(service, context);
	}

	@Test
	void addStorageTypeRejectsMissingName() {
		LookupService service = mock(LookupService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(AddLookupRequest.class)).andReturn(new AddLookupRequest(" "));
		expectResult(context, 400, "name is required");
		replay(service, context);

		new LookupController(service).addStorageType(context);

		verify(service, context);
	}

	@Test
	void addPartTypeRejectsMissingName() {
		LookupService service = mock(LookupService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(AddLookupRequest.class)).andReturn(new AddLookupRequest(" "));
		expectResult(context, 400, "name is required");
		replay(service, context);

		new LookupController(service).addPartType(context);

		verify(service, context);
	}

	@Test
	void addOperatingSystemRejectsMissingName() {
		LookupService service = mock(LookupService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(AddLookupRequest.class)).andReturn(new AddLookupRequest(" "));
		expectResult(context, 400, "name is required");
		replay(service, context);

		new LookupController(service).addOperatingSystem(context);

		verify(service, context);
	}

	@Test
	void addManufacturerDelegates() throws Exception {
		LookupService service = mock(LookupService.class);
		Context context = addContext("Dell");
		service.addManufacturer("Dell");
		replay(service, context);

		new LookupController(service).addManufacturer(context);

		verify(service, context);
	}

	@Test
	void deleteManufacturerMapsForeignKeyConflict() throws Exception {
		LookupService service = mock(LookupService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("name")).andReturn("Dell");
		service.removeManufacturer("Dell");
		expectLastCall().andThrow(new java.sql.SQLException("in use", "23503"));
		expectResult(context, 409, "Cannot delete \"Dell\" because it is still in use.");
		replay(service, context);

		new LookupController(service).deleteManufacturer(context);

		verify(service, context);
	}

	@Test
	void addRamGenerationDelegates() throws Exception {
		LookupService service = mock(LookupService.class);
		Context context = addContext("DDR4");
		service.addRamGeneration("DDR4");
		replay(service, context);

		new LookupController(service).addRamGeneration(context);

		verify(service, context);
	}

	@Test
	void addStorageTypeDelegates() throws Exception {
		LookupService service = mock(LookupService.class);
		Context context = addContext("SSD");
		service.addStorageType("SSD");
		replay(service, context);

		new LookupController(service).addStorageType(context);

		verify(service, context);
	}

	@Test
	void addPartTypeDelegates() throws Exception {
		LookupService service = mock(LookupService.class);
		Context context = addContext("RAM");
		service.addPartType("RAM");
		replay(service, context);

		new LookupController(service).addPartType(context);

		verify(service, context);
	}

	@Test
	void addOperatingSystemDelegates() throws Exception {
		LookupService service = mock(LookupService.class);
		Context context = addContext("Linux");
		service.addOperatingSystem("Linux");
		replay(service, context);

		new LookupController(service).addOperatingSystem(context);

		verify(service, context);
	}

	@Test
	void deleteRamGenerationDelegates() throws Exception {
		LookupService service = mock(LookupService.class);
		Context context = deleteContext("DDR4");
		service.removeRamGeneration("DDR4");
		replay(service, context);

		new LookupController(service).deleteRamGeneration(context);

		verify(service, context);
	}

	@Test
	void deleteStorageTypeDelegates() throws Exception {
		LookupService service = mock(LookupService.class);
		Context context = deleteContext("SSD");
		service.removeStorageType("SSD");
		replay(service, context);

		new LookupController(service).deleteStorageType(context);

		verify(service, context);
	}

	@Test
	void deletePartTypeDelegates() throws Exception {
		LookupService service = mock(LookupService.class);
		Context context = deleteContext("RAM");
		service.removePartType("RAM");
		replay(service, context);

		new LookupController(service).deletePartType(context);

		verify(service, context);
	}

	@Test
	void deleteOperatingSystemDelegates() throws Exception {
		LookupService service = mock(LookupService.class);
		Context context = deleteContext("Linux");
		service.removeOperatingSystem("Linux");
		replay(service, context);

		new LookupController(service).deleteOperatingSystem(context);

		verify(service, context);
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

	private Context addContext(String name) {
		Context context = mock(Context.class);
		expect(context.bodyAsClass(AddLookupRequest.class)).andReturn(new AddLookupRequest(name));
		expectStatus(context, 201);
		return context;
	}

	private Context deleteContext(String name) {
		Context context = mock(Context.class);
		expect(context.pathParam("name")).andReturn(name);
		expectStatus(context, 204);
		return context;
	}

	private void expectStatus(Context context, int status) {
		expect(context.status(status)).andReturn(context);
	}

	private void expectResult(Context context, int status, String result) {
		expectStatus(context, status);
		expect(context.result(result)).andReturn(context);
	}
}