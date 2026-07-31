package org.binaryheart.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import io.javalin.Javalin;
import io.javalin.http.Context;
import org.binaryheart.requests.PostNoteRequest;
import org.binaryheart.responses.NoteResponse;
import org.binaryheart.services.AuthorizationService;
import org.binaryheart.services.NoteService;
import org.junit.jupiter.api.Test;

class NoteControllerTest {

	@Test
	void registerRoutesDefinesEndpoints() {
		NoteService service = mock(NoteService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		replay(service, authorization);

		assertDoesNotThrow(() -> Javalin
			.create(config -> config.routes.apiBuilder(new NoteController(service, authorization)::registerRoutes)));

		verify(service, authorization);
	}

	@Test
	void postNoteRejectsEmptyTextWithoutCallingLowerLayers() {
		NoteService service = mock(NoteService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(PostNoteRequest.class)).andReturn(new PostNoteRequest(""));
		expectResult(context, 400, "Missing required parameter(s)");
		replay(service, authorization, context);

		new NoteController(service, authorization).postNote(context);

		verify(service, authorization, context);
	}

	@Test
	void updateNoteRejectsEmptyTextWithoutCallingLowerLayers() {
		NoteService service = mock(NoteService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(PostNoteRequest.class)).andReturn(new PostNoteRequest(null));
		expectResult(context, 400, "Missing required parameter(s)");
		replay(service, authorization, context);

		new NoteController(service, authorization).updateNote(context);

		verify(service, authorization, context);
	}

	@Test
	void postNoteDelegates() throws Exception {
		NoteService service = mock(NoteService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		NoteResponse note = new NoteResponse(3, "text", "today", 42);
		expect(context.bodyAsClass(PostNoteRequest.class)).andReturn(new PostNoteRequest("text"));
		expect(context.pathParam("id")).andReturn("42");
		expect(service.addNote(42, "text")).andReturn(note);
		expectJson(context, 200, note);
		replay(service, authorization, context);

		new NoteController(service, authorization).postNote(context);

		verify(service, authorization, context);
	}

	@Test
	void getNotesDelegates() throws Exception {
		NoteService service = mock(NoteService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		NoteResponse[] notes = {new NoteResponse(3, "text", "today", 42)};
		expect(context.pathParam("id")).andReturn("42");
		expect(service.getNotes(42)).andReturn(notes);
		expectJson(context, 200, notes);
		replay(service, authorization, context);

		new NoteController(service, authorization).getNotes(context);

		verify(service, authorization, context);
	}

	@Test
	void updateNoteAuthorizesThenDelegates() throws Exception {
		NoteService service = mock(NoteService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(PostNoteRequest.class)).andReturn(new PostNoteRequest("updated"));
		expect(context.pathParam("id")).andReturn("42");
		expect(context.pathParam("noteId")).andReturn("3");
		expect(service.getAssetChapterId(42)).andReturn(2);
		authorization.requireChapterEditAccess(context, 2);
		service.updateNote(42, 3, "updated");
		expectResult(context, 201, "Note updated successfully");
		replay(service, authorization, context);

		new NoteController(service, authorization).updateNote(context);

		verify(service, authorization, context);
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