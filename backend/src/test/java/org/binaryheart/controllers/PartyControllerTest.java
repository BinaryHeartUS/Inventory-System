package org.binaryheart.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import io.javalin.Javalin;
import io.javalin.http.Context;
import java.util.List;
import java.util.function.BiConsumer;
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

	private static final BiConsumer<PartyController, Context> INSERT_ORG = PartyController::insertOrg;
	private static final BiConsumer<PartyController, Context> UPDATE_ORG = PartyController::updateOrganization;
	private static final BiConsumer<PartyController, Context> INSERT_PERSON = PartyController::insertPerson;
	private static final BiConsumer<PartyController, Context> UPDATE_PERSON = PartyController::updatePerson;

	@Test
	void registerRoutesDefinesEndpoints() {
		PartyService service = mock(PartyService.class);
		replay(service);

		assertDoesNotThrow(
			() -> Javalin.create(config -> config.routes.apiBuilder(new PartyController(service)::registerRoutes)));

		verify(service);
	}

	@ParameterizedTest
	@MethodSource("invalidOrganizations")
	void organizationValidationStopsBeforeService(InsertOrganizationRequest request, String message,
		BiConsumer<PartyController, Context> handler) {
		PartyService service = mock(PartyService.class);
		Context context = mock(Context.class);
		if (handler == INSERT_ORG)
			expect(context.bodyAsClass(InsertOrganizationRequest.class)).andReturn(request);
		else {
			expect(context.pathParam("id")).andReturn("9");
			expect(context.bodyAsClass(UpdateOrganizationRequest.class)).andReturn(new UpdateOrganizationRequest(
				request.name(), request.location(), request.contactName(), request.contactEmail()));
		}
		expectResult(context, 400, message);
		replay(service, context);

		handler.accept(new PartyController(service), context);

		verify(service, context);
	}

	@ParameterizedTest
	@MethodSource("invalidPeople")
	void personValidationStopsBeforeService(InsertPersonRequest request, String message,
		BiConsumer<PartyController, Context> handler) {
		PartyService service = mock(PartyService.class);
		Context context = mock(Context.class);
		if (handler == INSERT_PERSON)
			expect(context.bodyAsClass(InsertPersonRequest.class)).andReturn(request);
		else {
			expect(context.pathParam("id")).andReturn("9");
			expect(context.bodyAsClass(UpdatePersonRequest.class))
				.andReturn(new UpdatePersonRequest(request.name(), request.location(), request.email()));
		}
		expectResult(context, 400, message);
		replay(service, context);

		handler.accept(new PartyController(service), context);

		verify(service, context);
	}

	@Test
	void validInsertAndUpdateDelegate() throws Exception {
		PartyService service = mock(PartyService.class);
		Context insert = mock(Context.class);
		Context update = mock(Context.class);
		InsertPersonRequest person = new InsertPersonRequest("Person", null, null);
		UpdatePersonRequest updated = new UpdatePersonRequest("Person", null, null);
		expect(insert.bodyAsClass(InsertPersonRequest.class)).andReturn(person);
		service.addPerson(person);
		expectResult(insert, 201, "Person added successfully");
		expect(update.pathParam("id")).andReturn("9");
		expect(update.bodyAsClass(UpdatePersonRequest.class)).andReturn(updated);
		service.updatePerson(9, updated);
		expectStatus(update, 204);
		replay(service, insert, update);
		PartyController controller = new PartyController(service);

		controller.insertPerson(insert);
		controller.updatePerson(update);

		verify(service, insert, update);
	}

	@Test
	void readsAndOrganizationUpdateDelegate() throws Exception {
		PartyService service = mock(PartyService.class);
		Context list = mock(Context.class);
		Context get = mock(Context.class);
		Context update = mock(Context.class);
		GetPartyResponse party = new GetPartyResponse(9, "Org", null, null, null, null);
		expect(list.queryParam("type")).andReturn("organization");
		expect(service.getAllParties(false, true)).andReturn(List.of(party));
		expectJson(list, 200, new GetPartyResponse[]{party});
		expectStatus(list, 201);
		expect(get.pathParam("id")).andReturn("9");
		expect(service.getParty(9)).andReturn(party);
		expectJson(get, 200, party);
		expectStatus(get, 201);
		UpdateOrganizationRequest request = new UpdateOrganizationRequest("Org", null, null, null);
		expect(update.pathParam("id")).andReturn("9");
		expect(update.bodyAsClass(UpdateOrganizationRequest.class)).andReturn(request);
		service.updateOrganization(9, request);
		expectStatus(update, 204);
		replay(service, list, get, update);
		PartyController controller = new PartyController(service);

		controller.getAllParties(list);
		controller.getParty(get);
		controller.updateOrganization(update);

		verify(service, list, get, update);
	}

	private static Stream<Arguments> invalidOrganizations() {
		return Stream.of(
			Arguments.of(new InsertOrganizationRequest(null, null, null, null), "Organization name must be non-null",
				INSERT_ORG),
			Arguments.of(new InsertOrganizationRequest("Org", null, "", null),
				"Contact name must be non-empty, or null", INSERT_ORG),
			Arguments.of(new InsertOrganizationRequest("Org", null, null, ""),
				"Contact email must be non-empty, or null", UPDATE_ORG),
			Arguments.of(new InsertOrganizationRequest("Org", "", null, null), "Location must be non-empty, or null",
				UPDATE_ORG));
	}

	private static Stream<Arguments> invalidPeople() {
		return Stream.of(
			Arguments.of(new InsertPersonRequest(null, null, null), "Person name must be non-null", INSERT_PERSON),
			Arguments.of(new InsertPersonRequest("Person", null, ""), "Email must be non-empty, or null",
				INSERT_PERSON),
			Arguments.of(new InsertPersonRequest("Person", "", null), "Location must be non-empty, or null",
				UPDATE_PERSON));
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