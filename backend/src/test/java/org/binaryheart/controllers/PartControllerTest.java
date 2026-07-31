package org.binaryheart.controllers;

import static org.binaryheart.TestFixtures.part;
import static org.binaryheart.TestFixtures.partResponse;
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
import org.binaryheart.requests.InsertPartRequest;
import org.binaryheart.requests.PartListRequest;
import org.binaryheart.responses.IdResponse;
import org.binaryheart.responses.PartChangelogResponse;
import org.binaryheart.responses.PartResponse;
import org.binaryheart.responses.PartTypeCountResponse;
import org.binaryheart.services.AuthorizationService;
import org.binaryheart.services.PartService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class PartControllerTest {

	@Test
	void registerRoutesDefinesEndpoints() {
		PartService service = mock(PartService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		replay(service, authorization);

		assertDoesNotThrow(() -> Javalin
			.create(config -> config.routes.apiBuilder(new PartController(service, authorization)::registerRoutes)));

		verify(service, authorization);
	}

	@ParameterizedTest
	@MethodSource("invalidPartInserts")
	void insertPartValidationStopsBeforeAuthorization(InsertPartRequest request, String message) {
		PartService service = mock(PartService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertPartRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, authorization, context);

		new PartController(service, authorization).insertPart(context);

		verify(service, authorization, context);
	}

	@ParameterizedTest
	@MethodSource("invalidPartUpdates")
	void updatePartValidationStopsBeforeAuthorization(InsertPartRequest request, String message) {
		PartService service = mock(PartService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertPartRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, authorization, context);

		new PartController(service, authorization).updatePart(context);

		verify(service, authorization, context);
	}

	@Test
	void validInsertRequiresAuthorizationThenDelegates() throws Exception {
		PartService service = mock(PartService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		InsertPartRequest request = part();
		expect(context.bodyAsClass(InsertPartRequest.class)).andReturn(request);
		authorization.requireChapterEditAccess(context, 2);
		expect(context.<String>attribute("username")).andReturn("user");
		expect(service.insertPart(request, "user")).andReturn(201);
		expectJson(context, 201, new IdResponse(201));
		replay(service, authorization, context);

		new PartController(service, authorization).insertPart(context);

		verify(service, authorization, context);
	}

	@Test
	void getAllPartsBuildsQueryAndDelegates() throws Exception {
		PartService service = mock(PartService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = partListContext();
		PartListRequest query = new PartListRequest("ram", "RAM", "purchased", true, 9, 25, 25);
		PartResponse part = partResponse();
		expect(service.getParts(List.of(2), 2, query)).andReturn(new PartResponse[]{part});
		expectJson(context, 200, new PartResponse[]{part});
		replay(service, authorization, context);

		new PartController(service, authorization).getAllParts(context);

		verify(service, authorization, context);
	}

	@Test
	void getPartTypeCountsBuildsQueryAndDelegates() throws Exception {
		PartService service = mock(PartService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = partCountContext();
		PartListRequest query = new PartListRequest("ram", "RAM", "purchased", true, 9, null, null);
		List<PartTypeCountResponse> typeCounts = List.of(new PartTypeCountResponse("RAM", 1));
		expect(service.getPartTypeCounts(List.of(2), 2, query)).andReturn(typeCounts);
		expectJson(context, 200, typeCounts);
		replay(service, authorization, context);

		new PartController(service, authorization).getPartTypeCounts(context);

		verify(service, authorization, context);
	}

	@Test
	void getPartDelegates() throws Exception {
		PartService service = mock(PartService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		PartResponse part = partResponse();
		expectIdContext(context, "id", "201", List.of(2));
		expect(service.getPart(List.of(2), 201)).andReturn(part);
		expectJson(context, 200, part);
		replay(service, authorization, context);

		new PartController(service, authorization).getPart(context);

		verify(service, authorization, context);
	}

	@Test
	void deletePartDelegates() throws Exception {
		PartService service = mock(PartService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expectIdContext(context, "id", "201", List.of(2));
		expect(context.<String>attribute("username")).andReturn("user");
		service.deletePart(List.of(2), 201, "user");
		expectStatus(context, 204);
		replay(service, authorization, context);

		new PartController(service, authorization).deletePart(context);

		verify(service, authorization, context);
	}

	@Test
	void updatePartAuthorizesThenDelegates() throws Exception {
		PartService service = mock(PartService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertPartRequest.class)).andReturn(part());
		authorization.requireChapterEditAccess(context, 2);
		expect(context.<String>attribute("username")).andReturn("user");
		service.updatePart(part(), "user");
		expectResult(context, 201, "Part updated successfully");
		replay(service, authorization, context);

		new PartController(service, authorization).updatePart(context);

		verify(service, authorization, context);
	}

	@Test
	void getPartsByDeviceDelegates() throws Exception {
		PartService service = mock(PartService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		PartResponse part = partResponse();
		expectIdContext(context, "deviceId", "101", List.of(2));
		expect(service.getPartsByDevice(List.of(2), 101)).andReturn(new PartResponse[]{part});
		expectJson(context, 200, new PartResponse[]{part});
		replay(service, authorization, context);

		new PartController(service, authorization).getPartsByDevice(context);

		verify(service, authorization, context);
	}

	@Test
	void getPartChangelogDelegates() throws Exception {
		PartService service = mock(PartService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expectIdContext(context, "id", "201", List.of(2));
		PartChangelogResponse[] changelog = new PartChangelogResponse[0];
		expect(service.getPartChangelog(List.of(2), 201)).andReturn(changelog);
		expectJson(context, 200, changelog);
		replay(service, authorization, context);

		new PartController(service, authorization).getPartChangelog(context);

		verify(service, authorization, context);
	}

	private static Stream<Arguments> invalidPartInserts() {
		InsertPartRequest valid = part();
		return Stream.of(
			Arguments.of(
				new InsertPartRequest(0, valid.type(), valid.description(), valid.wasPurchased(), valid.containedIn(),
					valid.id(), valid.acquisitionDate(), valid.value(), valid.donorId()),
				"Missing required parameters"),
			Arguments.of(new InsertPartRequest(2, "RAM", "desc", true, null, 0, null, null, null),
				"Asset ID must be positive or not specified"),
			Arguments.of(new InsertPartRequest(2, "RAM", "desc", true, null, 1, null, -1.0, null),
				"Value must be non-negative or not specified"));
	}

	private static Stream<Arguments> invalidPartUpdates() {
		return Stream.of(
			Arguments.of(new InsertPartRequest(2, "RAM", "desc", true, 0, 1, null, null, null),
				"Contained In ID must be positive or not specified"),
			Arguments.of(
				new InsertPartRequest(2, "RAM", "desc", true, null, 1, LocalDate.now().plusDays(1), null, null),
				"Acquisition date cannot be in the future"),
			Arguments.of(new InsertPartRequest(2, "RAM", "desc", true, null, 1, null, null, 0),
				"Donor ID must be positive or not specified"));
	}

	private Context partListContext() {
		Context context = mock(Context.class);
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(context.queryParam("pageSize")).andReturn("25");
		expect(context.queryParam("pageKey")).andReturn("1");
		expectPartFilters(context);
		return context;
	}

	private Context partCountContext() {
		Context context = mock(Context.class);
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expectPartFilters(context);
		return context;
	}

	private void expectPartFilters(Context context) {
		expect(context.queryParam("chapter")).andReturn("2");
		expect(context.queryParam("search")).andReturn("ram");
		expect(context.queryParam("type")).andReturn("RAM");
		expect(context.queryParam("source")).andReturn("purchased");
		expect(context.queryParam("includeInDevice")).andReturn("true");
		expect(context.queryParam("donorId")).andReturn("9");
	}

	private void expectIdContext(Context context, String name, String id, List<Integer> chapters) {
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(chapters);
		expect(context.pathParam(name)).andReturn(id);
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