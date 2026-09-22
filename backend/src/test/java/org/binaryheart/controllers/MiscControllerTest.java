package org.binaryheart.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
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
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.MiscNotFoundException;
import org.binaryheart.requests.InsertMiscRequest;
import org.binaryheart.responses.GetMiscResponse;
import org.binaryheart.responses.IdResponse;
import org.binaryheart.responses.MiscChangelogResponse;
import org.binaryheart.services.AuthorizationService;
import org.binaryheart.services.MiscService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class MiscControllerTest {
	private static final List<ChapterRole> EDITOR_ROLES = List.of(new ChapterRole(7, "Editor"));
	private static final InsertMiscRequest REQUEST = new InsertMiscRequest(null, "Cable bundle", null, 25.0, 9);
	private static final GetMiscResponse RESPONSE = new GetMiscResponse(401, LocalDate.of(2026, 9, 22), 25.0,
		"Cable bundle", 9);

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
	void insertReturnsConflictForDuplicateId() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertMiscRequest.class)).andReturn(REQUEST);
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(EDITOR_ROLES);
		authorization.requireInventoryEditAccess(EDITOR_ROLES);
		expect(context.<String>attribute("username")).andReturn("user");
		expect(service.insertMisc(REQUEST, "user")).andThrow(new DuplicateKeyException("duplicate"));
		expectResult(context, 409, "duplicate");
		replay(service, authorization, context);

		new MiscController(service, authorization).insertMisc(context);

		verify(service, authorization, context);
	}

	@Test
	void insertReturnsDatabaseError() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertMiscRequest.class)).andReturn(REQUEST);
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(EDITOR_ROLES);
		authorization.requireInventoryEditAccess(EDITOR_ROLES);
		expect(context.<String>attribute("username")).andReturn("user");
		expect(service.insertMisc(REQUEST, "user")).andThrow(new java.sql.SQLException("failure"));
		expectResult(context, 500, "Database error: failure");
		replay(service, authorization, context);

		new MiscController(service, authorization).insertMisc(context);

		verify(service, authorization, context);
	}

	@Test
	void donorListBuildsPaginationAndDelegates() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.queryParam("donorId")).andReturn("9");
		expect(context.queryParam("pageSize")).andReturn("25");
		expect(context.queryParam("pageKey")).andReturn("1");
		expect(service.getMiscByDonor(9, 25, 25)).andReturn(List.of(RESPONSE));
		expectJson(context, 200, new GetMiscResponse[]{RESPONSE});
		replay(service, authorization, context);

		new MiscController(service, authorization).getMiscByDonor(context);

		verify(service, authorization, context);
	}

	@ParameterizedTest
	@MethodSource("invalidDonorQueries")
	void donorListRejectsInvalidQuery(String donorId, String pageSize, String message) {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.queryParam("donorId")).andReturn(donorId);
		if ("9".equals(donorId))
			expect(context.queryParam("pageSize")).andReturn(pageSize);
		expectResult(context, 400, message);
		replay(service, authorization, context);

		new MiscController(service, authorization).getMiscByDonor(context);

		verify(service, authorization, context);
	}

	@Test
	void donorListReturnsDatabaseError() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.queryParam("donorId")).andReturn("9");
		expect(context.queryParam("pageSize")).andReturn("25");
		expect(context.queryParam("pageKey")).andReturn(null);
		expect(service.getMiscByDonor(9, 25, 0)).andThrow(new java.sql.SQLException("failure"));
		expectResult(context, 500, "Database error: failure");
		replay(service, authorization, context);

		new MiscController(service, authorization).getMiscByDonor(context);

		verify(service, authorization, context);
	}

	@Test
	void getMiscReturnsAsset() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("401");
		expect(service.getMisc(401)).andReturn(RESPONSE);
		expectJson(context, 200, RESPONSE);
		replay(service, authorization, context);

		new MiscController(service, authorization).getMisc(context);

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

	@Test
	void getMiscRejectsInvalidId() {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("invalid");
		expectResult(context, 400, "Misc asset ID must be a positive integer");
		replay(service, authorization, context);

		new MiscController(service, authorization).getMisc(context);

		verify(service, authorization, context);
	}

	@Test
	void getMiscReturnsDatabaseError() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("401");
		expect(service.getMisc(401)).andThrow(new java.sql.SQLException("failure"));
		expectResult(context, 500, "Database error: failure");
		replay(service, authorization, context);

		new MiscController(service, authorization).getMisc(context);

		verify(service, authorization, context);
	}

	@Test
	void updateUsesPathIdAndRequiresInventoryEditor() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		InsertMiscRequest body = new InsertMiscRequest(999, "Updated", null, 30.0, 10);
		InsertMiscRequest expected = new InsertMiscRequest(401, "Updated", null, 30.0, 10);
		expect(context.pathParam("id")).andReturn("401");
		expect(context.bodyAsClass(InsertMiscRequest.class)).andReturn(body);
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(EDITOR_ROLES);
		authorization.requireInventoryEditAccess(EDITOR_ROLES);
		expect(context.<String>attribute("username")).andReturn("user");
		service.updateMisc(expected, "user");
		expectStatus(context, 204);
		replay(service, authorization, context);

		new MiscController(service, authorization).updateMisc(context);

		verify(service, authorization, context);
	}

	@Test
	void updateReturnsNotFound() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		InsertMiscRequest expected = new InsertMiscRequest(401, "Cable bundle", null, 25.0, 9);
		expect(context.pathParam("id")).andReturn("401");
		expect(context.bodyAsClass(InsertMiscRequest.class)).andReturn(REQUEST);
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(EDITOR_ROLES);
		authorization.requireInventoryEditAccess(EDITOR_ROLES);
		expect(context.<String>attribute("username")).andReturn("user");
		service.updateMisc(expected, "user");
		expectLastCall().andThrow(new MiscNotFoundException("missing"));
		expectResult(context, 404, "missing");
		replay(service, authorization, context);

		new MiscController(service, authorization).updateMisc(context);

		verify(service, authorization, context);
	}

	@Test
	void updateReturnsDatabaseError() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		InsertMiscRequest expected = new InsertMiscRequest(401, "Cable bundle", null, 25.0, 9);
		expect(context.pathParam("id")).andReturn("401");
		expect(context.bodyAsClass(InsertMiscRequest.class)).andReturn(REQUEST);
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(EDITOR_ROLES);
		authorization.requireInventoryEditAccess(EDITOR_ROLES);
		expect(context.<String>attribute("username")).andReturn("user");
		service.updateMisc(expected, "user");
		expectLastCall().andThrow(new java.sql.SQLException("failure"));
		expectResult(context, 500, "Database error: failure");
		replay(service, authorization, context);

		new MiscController(service, authorization).updateMisc(context);

		verify(service, authorization, context);
	}

	@Test
	void deleteMiscDelegates() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("401");
		service.deleteMisc(401);
		expectStatus(context, 204);
		replay(service, authorization, context);

		new MiscController(service, authorization).deleteMisc(context);

		verify(service, authorization, context);
	}

	@Test
	void deleteMiscReturnsNotFound() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("401");
		service.deleteMisc(401);
		expectLastCall().andThrow(new MiscNotFoundException("missing"));
		expectResult(context, 404, "missing");
		replay(service, authorization, context);

		new MiscController(service, authorization).deleteMisc(context);

		verify(service, authorization, context);
	}

	@Test
	void deleteMiscReturnsDatabaseError() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("401");
		service.deleteMisc(401);
		expectLastCall().andThrow(new java.sql.SQLException("failure"));
		expectResult(context, 500, "Database error: failure");
		replay(service, authorization, context);

		new MiscController(service, authorization).deleteMisc(context);

		verify(service, authorization, context);
	}

	@Test
	void getMiscChangelogDelegates() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		MiscChangelogResponse[] changelog = new MiscChangelogResponse[0];
		expect(context.pathParam("id")).andReturn("401");
		expect(service.getMiscChangelog(401)).andReturn(changelog);
		expectJson(context, 200, changelog);
		replay(service, authorization, context);

		new MiscController(service, authorization).getMiscChangelog(context);

		verify(service, authorization, context);
	}

	@Test
	void getMiscChangelogReturnsNotFound() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("401");
		expectStatus(context, 200);
		expect(service.getMiscChangelog(401)).andThrow(new MiscNotFoundException("missing"));
		expectResult(context, 404, "missing");
		replay(service, authorization, context);

		new MiscController(service, authorization).getMiscChangelog(context);

		verify(service, authorization, context);
	}

	@Test
	void getMiscChangelogReturnsDatabaseError() throws Exception {
		MiscService service = mock(MiscService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("401");
		expectStatus(context, 200);
		expect(service.getMiscChangelog(401)).andThrow(new java.sql.SQLException("failure"));
		expectResult(context, 500, "Database error: failure");
		replay(service, authorization, context);

		new MiscController(service, authorization).getMiscChangelog(context);

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
			Arguments.of(new InsertMiscRequest(null, "Cable", null, 25.0, 0), "Donor ID must be positive"),
			Arguments.of(new InsertMiscRequest(0, "Cable", null, 25.0, 9), "Asset ID must be positive"),
			Arguments.of(new InsertMiscRequest(null, "x".repeat(501), null, 25.0, 9),
				"Description cannot exceed 500 characters"),
			Arguments.of(new InsertMiscRequest(null, "Cable", LocalDate.now().plusDays(1), 25.0, 9),
				"Acquisition date cannot be in the future"));
	}

	private static Stream<Arguments> invalidDonorQueries() {
		return Stream.of(Arguments.of(null, null, "A positive donorId is required"),
			Arguments.of("0", null, "A positive donorId is required"),
			Arguments.of("invalid", null, "donorId must be an integer: invalid"),
			Arguments.of("9", null, "pageSize is required"),
			Arguments.of("9", "0", "pageSize must be between 1 and 1000"));
	}

	private void expectStatus(Context context, int status) {
		expect(context.status(status)).andReturn(context);
	}

	private void expectResult(Context context, int status, String result) {
		expectStatus(context, status);
		expect(context.result(result)).andReturn(context);
	}

	private void expectJson(Context context, int status, Object body) {
		expect(context.status(status)).andReturn(context);
		expect(context.json(body)).andReturn(context);
	}
}