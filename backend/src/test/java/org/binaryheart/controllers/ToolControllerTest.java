package org.binaryheart.controllers;

import static org.binaryheart.TestFixtures.tool;
import static org.binaryheart.TestFixtures.toolResponse;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import io.javalin.http.Context;
import java.time.LocalDate;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.stream.Stream;
import org.binaryheart.requests.InsertToolRequest;
import org.binaryheart.requests.ToolListRequest;
import org.binaryheart.responses.GetToolResponse;
import org.binaryheart.responses.IdResponse;
import org.binaryheart.responses.ToolChangelogResponse;
import org.binaryheart.services.AuthorizationService;
import org.binaryheart.services.ToolService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class ToolControllerTest {

	@ParameterizedTest
	@MethodSource("invalidTools")
	void insertAndUpdateValidationStopsBeforeAuthorization(InsertToolRequest request, String message,
		BiConsumer<ToolController, Context> handler) {
		ToolService service = mock(ToolService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertToolRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, authorization, context);

		handler.accept(new ToolController(service, authorization), context);

		verify(service, authorization, context);
	}

	@Test
	void validInsertRequiresAuthorizationThenDelegates() throws Exception {
		ToolService service = mock(ToolService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		InsertToolRequest request = tool();
		expect(context.bodyAsClass(InsertToolRequest.class)).andReturn(request);
		authorization.requireChapterEditAccess(context, 2);
		expect(context.<String>attribute("username")).andReturn("user");
		expect(service.insertTool(request, "user")).andReturn(301);
		expectJson(context, 201, new IdResponse(301));
		replay(service, authorization, context);

		new ToolController(service, authorization).insertTool(context);

		verify(service, authorization, context);
	}

	@Test
	void handlersBuildQueryAndDelegateReadsDeletesUpdatesAndChangelog() throws Exception {
		ToolService service = mock(ToolService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context list = toolListContext();
		Context get = mock(Context.class);
		Context delete = mock(Context.class);
		Context update = mock(Context.class);
		Context changelogContext = mock(Context.class);
		ToolListRequest query = new ToolListRequest("driver", 9, 25, 25);
		GetToolResponse tool = toolResponse();
		expect(service.getTools(List.of(2), 2, query)).andReturn(List.of(tool));
		expectJson(list, 200, new GetToolResponse[]{tool});
		expectIdContext(get, "id", "301", List.of(2));
		expect(service.getTool(List.of(2), 301)).andReturn(tool);
		expectJson(get, 200, tool);
		expectIdContext(delete, "id", "301", List.of(2));
		service.deleteTool(List.of(2), 301);
		expectResult(delete, 204, "Tool deleted successfully");
		expect(update.bodyAsClass(InsertToolRequest.class)).andReturn(tool());
		authorization.requireChapterEditAccess(update, 2);
		expect(update.<String>attribute("username")).andReturn("user");
		service.updateTool(tool(), "user");
		expectResult(update, 201, "Tool updated successfully");
		expectIdContext(changelogContext, "id", "301", List.of(2));
		ToolChangelogResponse[] changelog = new ToolChangelogResponse[0];
		expect(service.getToolChangelog(List.of(2), 301)).andReturn(changelog);
		expectJson(changelogContext, 200, changelog);
		replay(service, authorization, list, get, delete, update, changelogContext);
		ToolController controller = new ToolController(service, authorization);

		controller.getAllTools(list);
		controller.getTool(get);
		controller.deleteTool(delete);
		controller.updateTool(update);
		controller.getToolChangelog(changelogContext);

		verify(service, authorization, list, get, delete, update, changelogContext);
	}

	private static Stream<Arguments> invalidTools() {
		return Stream.of(
			Arguments.of(new InsertToolRequest(0, null, null, null, null, null), "Missing required parameters",
				(BiConsumer<ToolController, Context>) ToolController::insertTool),
			Arguments.of(new InsertToolRequest(2, null, "", null, null, null), "Description cannot be empty string",
				(BiConsumer<ToolController, Context>) ToolController::updateTool),
			Arguments.of(new InsertToolRequest(2, null, "tool", null, -1.0, null),
				"Value must be non-negative or not specified",
				(BiConsumer<ToolController, Context>) ToolController::insertTool),
			Arguments.of(new InsertToolRequest(2, null, "tool", LocalDate.now().plusDays(1), null, null),
				"Acquisition date cannot be in the future",
				(BiConsumer<ToolController, Context>) ToolController::updateTool),
			Arguments.of(new InsertToolRequest(2, 0, "tool", null, null, null),
				"Asset ID must be positive or not specified",
				(BiConsumer<ToolController, Context>) ToolController::insertTool));
	}

	private Context toolListContext() {
		Context context = mock(Context.class);
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(context.queryParam("pageSize")).andReturn("25");
		expect(context.queryParam("pageKey")).andReturn("1");
		expect(context.queryParam("chapter")).andReturn("2");
		expect(context.queryParam("search")).andReturn("driver");
		expect(context.queryParam("donorId")).andReturn("9");
		return context;
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