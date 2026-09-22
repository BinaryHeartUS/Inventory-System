package org.binaryheart.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import io.javalin.Javalin;
import io.javalin.http.Context;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;
import org.binaryheart.models.ChapterRole;
import org.binaryheart.requests.InsertMiscRequest;
import org.binaryheart.responses.GetMiscResponse;
import org.binaryheart.responses.IdResponse;
import org.binaryheart.services.AuthorizationService;
import org.binaryheart.services.MiscService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class MiscControllerTest {
	private static final List<ChapterRole> EDITOR_ROLES = List.of(new ChapterRole(7, "Editor"));
	private static final InsertMiscRequest REQUEST = new InsertMiscRequest(null, "Cable bundle", null, 25.0, 9);

	@Test
	void registerRoutesDefinesEndpoints() {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		replay(service, authorization);

		assertDoesNotThrow(() -> Javalin
			.create(config -> config.routes.apiBuilder(new MiscController(service, authorization)::registerRoutes)));

		verify(service, authorization);
	}

	@ParameterizedTest
	@MethodSource("invalidRequests")
	void insertValidationRejectsInvalidFields(InsertMiscRequest request, String message) {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertMiscRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, authorization, context);

		new MiscController(service, authorization).insertMisc(context);

		verify(service, authorization, context);
	}

	@Test
	void validInsertRequiresInventoryEditorThenDelegates() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertMiscRequest.class)).andReturn(REQUEST);
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(EDITOR_ROLES);
		authorization.requireInventoryEditAccess(EDITOR_ROLES);
		expect(context.<String>attribute("username")).andReturn("user");
		expect(service.insertMisc(REQUEST, "user")).andReturn(401);
		expectJson(context, 201, new IdResponse(401));
		replay(service, authorization, context);

		new MiscController(service, authorization).insertMisc(context);

		verify(service, authorization, context);
	}

	@Test
	void donorListBuildsPaginationAndDelegates() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		GetMiscResponse response = new GetMiscResponse(401, LocalDate.of(2026, 9, 22), 25.0, "Cable bundle", 9);
		expect(context.queryParam("donorId")).andReturn("9");
		expect(context.queryParam("pageSize")).andReturn("25");
		expect(context.queryParam("pageKey")).andReturn("1");
		expect(service.getMiscAssets(9, 25, 25)).andReturn(List.of(response));
		expectJson(context, 200, new GetMiscResponse[]{response});
		replay(service, authorization, context);

		new MiscController(service, authorization).getMiscAssets(context);

		verify(service, authorization, context);
	}

	@Test
	void getMiscReturnsNotFound() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("401");
		expect(service.getMisc(401)).andReturn(null);
		expectResult(context, 404, "No misc asset with provided ID found");
		replay(service, authorization, context);

		new MiscController(service, authorization).getMisc(context);

		verify(service, authorization, context);
	}

	private static Stream<Arguments> invalidRequests() {
		return Stream.of(
			Arguments.of(new InsertMiscRequest(null, "", null, 25.0, 9), "Description, value, and donor are required"),
			Arguments.of(new InsertMiscRequest(null, "Cable", null, null, 9),
				"Description, value, and donor are required"),
			Arguments.of(new InsertMiscRequest(null, "Cable", null, 25.0, null),
				"Description, value, and donor are required"),
			Arguments.of(new InsertMiscRequest(null, "Cable", null, -1.0, 9), "Value must be non-negative"),
			Arguments.of(new InsertMiscRequest(null, "Cable", LocalDate.now().plusDays(1), 25.0, 9),
				"Acquisition date cannot be in the future"));
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