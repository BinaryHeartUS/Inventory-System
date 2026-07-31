package org.binaryheart.controllers;

import static org.binaryheart.TestFixtures.tool;
import static org.binaryheart.TestFixtures.toolResponse;
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

	@Test
	void registerRoutesDefinesEndpoints() {
		ToolService service = mock(ToolService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		replay(service, authorization);

		assertDoesNotThrow(() -> Javalin
			.create(config -> config.routes.apiBuilder(new ToolController(service, authorization)::registerRoutes)));

		verify(service, authorization);
	}

	@ParameterizedTest
	@MethodSource("invalidToolInserts")
	void insertToolValidationStopsBeforeAuthorization(InsertToolRequest request, String message) {
		ToolService service = mock(ToolService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertToolRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, authorization, context);

		new ToolController(service, authorization).insertTool(context);

		verify(service, authorization, context);
	}

	@ParameterizedTest
	@MethodSource("invalidToolUpdates")
	void updateToolValidationStopsBeforeAuthorization(InsertToolRequest request, String message) {
		ToolService service = mock(ToolService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertToolRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, authorization, context);

		new ToolController(service, authorization).updateTool(context);

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
	void getAllToolsBuildsQueryAndDelegates() throws Exception {
		ToolService service = mock(ToolService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = toolListContext();
		ToolListRequest query = new ToolListRequest("driver", 9, 25, 25);
		GetToolResponse tool = toolResponse();
		expect(service.getTools(List.of(2), 2, query)).andReturn(List.of(tool));
		expectJson(context, 200, new GetToolResponse[]{tool});
		replay(service, authorization, context);

		new ToolController(service, authorization).getAllTools(context);

		verify(service, authorization, context);
	}

	@Test
	void getToolDelegates() throws Exception {
		ToolService service = mock(ToolService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		GetToolResponse tool = toolResponse();
		expectIdContext(context, "id", "301", List.of(2));
		expect(service.getTool(List.of(2), 301)).andReturn(tool);
		expectJson(context, 200, tool);
		replay(service, authorization, context);

		new ToolController(service, authorization).getTool(context);

		verify(service, authorization, context);
	}

	@Test
	void deleteToolDelegates() throws Exception {
		ToolService service = mock(ToolService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expectIdContext(context, "id", "301", List.of(2));
		service.deleteTool(List.of(2), 301);
		expectResult(context, 204, "Tool deleted successfully");
		replay(service, authorization, context);

		new ToolController(service, authorization).deleteTool(context);

		verify(service, authorization, context);
	}

	@Test
	void updateToolAuthorizesThenDelegates() throws Exception {
		ToolService service = mock(ToolService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertToolRequest.class)).andReturn(tool());
		authorization.requireChapterEditAccess(context, 2);
		expect(context.<String>attribute("username")).andReturn("user");
		service.updateTool(tool(), "user");
		expectResult(context, 201, "Tool updated successfully");
		replay(service, authorization, context);

		new ToolController(service, authorization).updateTool(context);

		verify(service, authorization, context);
	}

	@Test
	void getToolChangelogDelegates() throws Exception {
		ToolService service = mock(ToolService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expectIdContext(context, "id", "301", List.of(2));
		ToolChangelogResponse[] changelog = new ToolChangelogResponse[0];
		expect(service.getToolChangelog(List.of(2), 301)).andReturn(changelog);
		expectJson(context, 200, changelog);
		replay(service, authorization, context);

		new ToolController(service, authorization).getToolChangelog(context);

		verify(service, authorization, context);
	}

	private static Stream<Arguments> invalidToolInserts() {
		return Stream.of(
			Arguments.of(new InsertToolRequest(0, null, null, null, null, null), "Missing required parameters"),
			Arguments.of(new InsertToolRequest(2, null, "tool", null, -1.0, null),
				"Value must be non-negative or not specified"),
			Arguments.of(new InsertToolRequest(2, 0, "tool", null, null, null),
				"Asset ID must be positive or not specified"));
	}

	private static Stream<Arguments> invalidToolUpdates() {
		return Stream.of(
			Arguments.of(new InsertToolRequest(2, null, "", null, null, null), "Description cannot be empty string"),
			Arguments.of(new InsertToolRequest(2, null, "tool", LocalDate.now().plusDays(1), null, null),
				"Acquisition date cannot be in the future"));
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