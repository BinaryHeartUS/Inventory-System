package org.binaryheart.controllers;

import static org.binaryheart.TestFixtures.part;
import static org.binaryheart.TestFixtures.partResponse;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import io.javalin.http.Context;
import java.time.LocalDate;
import java.util.List;
import java.util.function.BiConsumer;
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

	@ParameterizedTest
	@MethodSource("invalidParts")
	void insertAndUpdateValidationStopsBeforeAuthorization(InsertPartRequest request, String message,
		BiConsumer<PartController, Context> handler) {
		PartService service = mock(PartService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertPartRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, authorization, context);

		handler.accept(new PartController(service, authorization), context);

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
	void handlersBuildQueriesAndDelegateReadsDeletesAndUpdates() throws Exception {
		PartService service = mock(PartService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context list = partListContext();
		Context counts = partCountContext();
		Context get = mock(Context.class);
		Context delete = mock(Context.class);
		Context update = mock(Context.class);
		Context byDevice = mock(Context.class);
		Context changelogContext = mock(Context.class);
		PartListRequest listQuery = new PartListRequest("ram", "RAM", "purchased", true, 9, 25, 25);
		PartListRequest countQuery = new PartListRequest("ram", "RAM", "purchased", true, 9, null, null);
		PartResponse part = partResponse();
		List<PartTypeCountResponse> typeCounts = List.of(new PartTypeCountResponse("RAM", 1));
		expect(service.getParts(List.of(2), 2, listQuery)).andReturn(new PartResponse[]{part});
		expectJson(list, 200, new PartResponse[]{part});
		expect(service.getPartTypeCounts(List.of(2), 2, countQuery)).andReturn(typeCounts);
		expectJson(counts, 200, typeCounts);
		expectIdContext(get, "id", "201", List.of(2));
		expect(service.getPart(List.of(2), 201)).andReturn(part);
		expectJson(get, 200, part);
		expectIdContext(delete, "id", "201", List.of(2));
		expect(delete.<String>attribute("username")).andReturn("user");
		service.deletePart(List.of(2), 201, "user");
		expectStatus(delete, 204);
		expect(update.bodyAsClass(InsertPartRequest.class)).andReturn(part());
		authorization.requireChapterEditAccess(update, 2);
		expect(update.<String>attribute("username")).andReturn("user");
		service.updatePart(part(), "user");
		expectResult(update, 201, "Part updated successfully");
		expectIdContext(byDevice, "deviceId", "101", List.of(2));
		expect(service.getPartsByDevice(List.of(2), 101)).andReturn(new PartResponse[]{part});
		expectJson(byDevice, 200, new PartResponse[]{part});
		expectIdContext(changelogContext, "id", "201", List.of(2));
		PartChangelogResponse[] changelog = new PartChangelogResponse[0];
		expect(service.getPartChangelog(List.of(2), 201)).andReturn(changelog);
		expectJson(changelogContext, 200, changelog);
		replay(service, authorization, list, counts, get, delete, update, byDevice, changelogContext);
		PartController controller = new PartController(service, authorization);

		controller.getAllParts(list);
		controller.getPartTypeCounts(counts);
		controller.getPart(get);
		controller.deletePart(delete);
		controller.updatePart(update);
		controller.getPartsByDevice(byDevice);
		controller.getPartChangelog(changelogContext);

		verify(service, authorization, list, counts, get, delete, update, byDevice, changelogContext);
	}

	private static Stream<Arguments> invalidParts() {
		InsertPartRequest valid = part();
		return Stream.of(
			Arguments.of(
				new InsertPartRequest(0, valid.type(), valid.description(), valid.wasPurchased(), valid.containedIn(),
					valid.id(), valid.acquisitionDate(), valid.value(), valid.donorId()),
				"Missing required parameters", (BiConsumer<PartController, Context>) PartController::insertPart),
			Arguments.of(new InsertPartRequest(2, "RAM", "desc", true, 0, 1, null, null, null),
				"Contained In ID must be positive or not specified",
				(BiConsumer<PartController, Context>) PartController::updatePart),
			Arguments.of(new InsertPartRequest(2, "RAM", "desc", true, null, 0, null, null, null),
				"Asset ID must be positive or not specified",
				(BiConsumer<PartController, Context>) PartController::insertPart),
			Arguments.of(
				new InsertPartRequest(2, "RAM", "desc", true, null, 1, LocalDate.now().plusDays(1), null, null),
				"Acquisition date cannot be in the future",
				(BiConsumer<PartController, Context>) PartController::updatePart),
			Arguments.of(new InsertPartRequest(2, "RAM", "desc", true, null, 1, null, -1.0, null),
				"Value must be non-negative or not specified",
				(BiConsumer<PartController, Context>) PartController::insertPart),
			Arguments.of(new InsertPartRequest(2, "RAM", "desc", true, null, 1, null, null, 0),
				"Donor ID must be positive or not specified",
				(BiConsumer<PartController, Context>) PartController::updatePart));
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