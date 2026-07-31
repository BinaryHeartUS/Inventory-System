package org.binaryheart.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import io.javalin.Javalin;
import io.javalin.http.Context;
import java.util.List;
import java.util.stream.Stream;
import org.binaryheart.requests.InsertOrganizationRequest;
import org.binaryheart.requests.InsertPersonRequest;
import org.binaryheart.requests.UpdateOrganizationRequest;
import org.binaryheart.requests.UpdatePersonRequest;
import org.binaryheart.responses.GetPartyResponse;
import org.binaryheart.services.PartyService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class PartyControllerTest {

	@Test
	void registerRoutesDefinesEndpoints() {
		PartyService service = mock(PartyService.class);
		replay(service);

		assertDoesNotThrow(
			() -> Javalin.create(config -> config.routes.apiBuilder(new PartyController(service)::registerRoutes)));

		verify(service);
	}

	@ParameterizedTest
	@MethodSource("invalidOrganizationInserts")
	void insertOrganizationValidationStopsBeforeService(InsertOrganizationRequest request, String message) {
		PartyService service = mock(PartyService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertOrganizationRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, context);

		new PartyController(service).insertOrg(context);

		verify(service, context);
	}

	@ParameterizedTest
	@MethodSource("invalidOrganizationUpdates")
	void updateOrganizationValidationStopsBeforeService(UpdateOrganizationRequest request, String message) {
		PartyService service = mock(PartyService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("9");
		expect(context.bodyAsClass(UpdateOrganizationRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, context);

		new PartyController(service).updateOrganization(context);

		verify(service, context);
	}

	@ParameterizedTest
	@MethodSource("invalidPersonInserts")
	void insertPersonValidationStopsBeforeService(InsertPersonRequest request, String message) {
		PartyService service = mock(PartyService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertPersonRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, context);

		new PartyController(service).insertPerson(context);

		verify(service, context);
	}

	@Test
	void updatePersonValidationStopsBeforeService() {
		PartyService service = mock(PartyService.class);
		Context context = mock(Context.class);
		UpdatePersonRequest request = new UpdatePersonRequest("Person", "", null);
		expect(context.pathParam("id")).andReturn("9");
		expect(context.bodyAsClass(UpdatePersonRequest.class)).andReturn(request);
		expectResult(context, 400, "Location must be non-empty, or null");
		replay(service, context);

		new PartyController(service).updatePerson(context);

		verify(service, context);
	}

	@Test
	void insertPersonDelegates() throws Exception {
		PartyService service = mock(PartyService.class);
		Context context = mock(Context.class);
		InsertPersonRequest person = new InsertPersonRequest("Person", null, null);
		expect(context.bodyAsClass(InsertPersonRequest.class)).andReturn(person);
		service.addPerson(person);
		expectResult(context, 201, "Person added successfully");
		replay(service, context);

		new PartyController(service).insertPerson(context);

		verify(service, context);
	}

	@Test
	void updatePersonDelegates() throws Exception {
		PartyService service = mock(PartyService.class);
		Context context = mock(Context.class);
		UpdatePersonRequest request = new UpdatePersonRequest("Person", null, null);
		expect(context.pathParam("id")).andReturn("9");
		expect(context.bodyAsClass(UpdatePersonRequest.class)).andReturn(request);
		service.updatePerson(9, request);
		expectStatus(context, 204);
		replay(service, context);

		new PartyController(service).updatePerson(context);

		verify(service, context);
	}

	@Test
	void getAllPartiesDelegates() throws Exception {
		PartyService service = mock(PartyService.class);
		Context context = mock(Context.class);
		GetPartyResponse party = new GetPartyResponse(9, "Org", null, null, null, null);
		expect(context.queryParam("type")).andReturn("organization");
		expect(service.getAllParties(false, true)).andReturn(List.of(party));
		expectJson(context, 200, new GetPartyResponse[]{party});
		expectStatus(context, 201);
		replay(service, context);

		new PartyController(service).getAllParties(context);

		verify(service, context);
	}

	@Test
	void getPartyDelegates() throws Exception {
		PartyService service = mock(PartyService.class);
		Context context = mock(Context.class);
		GetPartyResponse party = new GetPartyResponse(9, "Org", null, null, null, null);
		expect(context.pathParam("id")).andReturn("9");
		expect(service.getParty(9)).andReturn(party);
		expectJson(context, 200, party);
		expectStatus(context, 201);
		replay(service, context);

		new PartyController(service).getParty(context);

		verify(service, context);
	}

	@Test
	void updateOrganizationDelegates() throws Exception {
		PartyService service = mock(PartyService.class);
		Context context = mock(Context.class);
		UpdateOrganizationRequest request = new UpdateOrganizationRequest("Org", null, null, null);
		expect(context.pathParam("id")).andReturn("9");
		expect(context.bodyAsClass(UpdateOrganizationRequest.class)).andReturn(request);
		service.updateOrganization(9, request);
		expectStatus(context, 204);
		replay(service, context);

		new PartyController(service).updateOrganization(context);

		verify(service, context);
	}

	private static Stream<Arguments> invalidOrganizationInserts() {
		return Stream.of(
			Arguments.of(new InsertOrganizationRequest(null, null, null, null), "Organization name must be non-null"),
			Arguments.of(new InsertOrganizationRequest("Org", null, "", null),
				"Contact name must be non-empty, or null"));
	}

	private static Stream<Arguments> invalidOrganizationUpdates() {
		return Stream.of(
			Arguments.of(new UpdateOrganizationRequest("Org", null, null, ""),
				"Contact email must be non-empty, or null"),
			Arguments.of(new UpdateOrganizationRequest("Org", "", null, null), "Location must be non-empty, or null"));
	}

	private static Stream<Arguments> invalidPersonInserts() {
		return Stream.of(Arguments.of(new InsertPersonRequest(null, null, null), "Person name must be non-null"),
			Arguments.of(new InsertPersonRequest("Person", null, ""), "Email must be non-empty, or null"));
	}

	private void expectStatus(Context context, int status) {
		expect(context.status(status)).andReturn(context);
	}

	private void expectResult(Context context, int status, String result) {
		expectStatus(context, status);
		expect(context.result(result)).andReturn(context);
	}

	private void expectJson(Context context, int status, Object body) {
		expectStatus(context, status);
		expect(context.json(body)).andReturn(context);
	}
}