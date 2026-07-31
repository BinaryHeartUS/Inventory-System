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
	void createChapterRejectsBlankName() {
		ChapterService service = mock(ChapterService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(CreateChapterRequest.class)).andReturn(new CreateChapterRequest(" "));
		expectResult(context, 400, "Chapter name must not be blank");
		replay(service, context);

		new ChapterController(service).createChapter(context);

		verify(service, context);
	}

	@Test
	void createChapterRejectsUnauthorizedCaller() throws Exception {
		ChapterService service = mock(ChapterService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(CreateChapterRequest.class)).andReturn(new CreateChapterRequest("Chapter"));
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(service.getNationalChapterId()).andReturn(1);
		replay(service, context);
		ChapterController controller = new ChapterController(service);

		assertThrows(ForbiddenResponse.class, () -> controller.createChapter(context));

		verify(service, context);
	}

	@Test
	void getChaptersDelegates() throws Exception {
		ChapterService service = mock(ChapterService.class);
		Context context = mock(Context.class);
		List<ChapterSummary> chapters = List.of(new ChapterSummary(1, "National"));
		expect(service.getAllChapters()).andReturn(chapters);
		expect(context.json(chapters)).andReturn(context);
		replay(service, context);

		new ChapterController(service).getChapters(context);

		verify(service, context);
	}

	@Test
	void createChapterDelegates() throws Exception {
		ChapterService service = mock(ChapterService.class);
		Context context = mock(Context.class);
		ChapterSummary created = new ChapterSummary(2, "Chapter Two");
		expect(context.bodyAsClass(CreateChapterRequest.class)).andReturn(new CreateChapterRequest("Chapter Two"));
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(1));
		expect(service.getNationalChapterId()).andReturn(1);
		expect(service.createChapter("Chapter Two")).andReturn(created);
		expectJson(context, 201, created);
		replay(service, context);

		new ChapterController(service).createChapter(context);

		verify(service, context);
	}

	@Test
	void deleteChapterDelegates() throws Exception {
		ChapterService service = mock(ChapterService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("2");
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(1));
		expect(service.getNationalChapterId()).andReturn(1);
		service.deleteChapter(2, 1, List.of(1));
		expectStatus(context, 204);
		replay(service, context);

		new ChapterController(service).deleteChapter(context);

		verify(service, context);
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