package org.binaryheart.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import java.util.List;
import org.binaryheart.requests.CreateChapterRequest;
import org.binaryheart.responses.ChapterSummary;
import org.binaryheart.services.ChapterService;
import org.junit.jupiter.api.Test;

class ChapterControllerTest {

	@Test
	void registerRoutesDefinesEndpoints() {
		ChapterService service = mock(ChapterService.class);
		replay(service);

		assertDoesNotThrow(
			() -> Javalin.create(config -> config.routes.apiBuilder(new ChapterController(service)::registerRoutes)));

		verify(service);
	}

	@Test
	void rejectsBlankNameAndUnauthorizedCaller() throws Exception {
		ChapterService service = mock(ChapterService.class);
		Context blank = mock(Context.class);
		Context unauthorized = mock(Context.class);
		expect(blank.bodyAsClass(CreateChapterRequest.class)).andReturn(new CreateChapterRequest(" "));
		expectResult(blank, 400, "Chapter name must not be blank");
		expect(unauthorized.bodyAsClass(CreateChapterRequest.class)).andReturn(new CreateChapterRequest("Chapter"));
		expect(unauthorized.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(service.getNationalChapterId()).andReturn(1);
		replay(service, blank, unauthorized);
		ChapterController controller = new ChapterController(service);

		controller.createChapter(blank);
		assertThrows(ForbiddenResponse.class, () -> controller.createChapter(unauthorized));

		verify(service, blank, unauthorized);
	}

	@Test
	void delegatesListCreateAndDelete() throws Exception {
		ChapterService service = mock(ChapterService.class);
		Context listContext = mock(Context.class);
		Context createContext = mock(Context.class);
		Context deleteContext = mock(Context.class);
		List<ChapterSummary> chapters = List.of(new ChapterSummary(1, "National"));
		ChapterSummary created = new ChapterSummary(2, "Chapter Two");
		expect(service.getAllChapters()).andReturn(chapters);
		expect(listContext.json(chapters)).andReturn(listContext);
		expect(createContext.bodyAsClass(CreateChapterRequest.class))
			.andReturn(new CreateChapterRequest("Chapter Two"));
		expect(createContext.<List<Integer>>attribute("chapterIds")).andReturn(List.of(1));
		expect(service.getNationalChapterId()).andReturn(1).times(2);
		expect(service.createChapter("Chapter Two")).andReturn(created);
		expectJson(createContext, 201, created);
		expect(deleteContext.pathParam("id")).andReturn("2");
		expect(deleteContext.<List<Integer>>attribute("chapterIds")).andReturn(List.of(1));
		service.deleteChapter(2, 1, List.of(1));
		expectStatus(deleteContext, 204);
		replay(service, listContext, createContext, deleteContext);
		ChapterController controller = new ChapterController(service);

		controller.getChapters(listContext);
		controller.createChapter(createContext);
		controller.deleteChapter(deleteContext);

		verify(service, listContext, createContext, deleteContext);
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