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
	void rejectsEmptyPostAndUpdateWithoutCallingLowerLayers() {
		NoteService service = mock(NoteService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context postContext = mock(Context.class);
		Context updateContext = mock(Context.class);
		expect(postContext.bodyAsClass(PostNoteRequest.class)).andReturn(new PostNoteRequest(""));
		expectResult(postContext, 400, "Missing required parameter(s)");
		expect(updateContext.bodyAsClass(PostNoteRequest.class)).andReturn(new PostNoteRequest(null));
		expectResult(updateContext, 400, "Missing required parameter(s)");
		replay(service, authorization, postContext, updateContext);
		NoteController controller = new NoteController(service, authorization);

		controller.postNote(postContext);
		controller.updateNote(updateContext);

		verify(service, authorization, postContext, updateContext);
	}

	@Test
	void delegatesPostGetAndAuthorizedUpdate() throws Exception {
		NoteService service = mock(NoteService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context postContext = mock(Context.class);
		Context getContext = mock(Context.class);
		Context updateContext = mock(Context.class);
		NoteResponse note = new NoteResponse(3, "text", "today", 42);
		NoteResponse[] notes = {note};
		expect(postContext.bodyAsClass(PostNoteRequest.class)).andReturn(new PostNoteRequest("text"));
		expect(postContext.pathParam("id")).andReturn("42");
		expect(service.addNote(42, "text")).andReturn(note);
		expectJson(postContext, 200, note);
		expect(getContext.pathParam("id")).andReturn("42");
		expect(service.getNotes(42)).andReturn(notes);
		expectJson(getContext, 200, notes);
		expect(updateContext.bodyAsClass(PostNoteRequest.class)).andReturn(new PostNoteRequest("updated"));
		expect(updateContext.pathParam("id")).andReturn("42");
		expect(updateContext.pathParam("noteId")).andReturn("3");
		expect(service.getAssetChapterId(42)).andReturn(2);
		authorization.requireChapterEditAccess(updateContext, 2);
		service.updateNote(42, 3, "updated");
		expectResult(updateContext, 201, "Note updated successfully");
		replay(service, authorization, postContext, getContext, updateContext);
		NoteController controller = new NoteController(service, authorization);

		controller.postNote(postContext);
		controller.getNotes(getContext);
		controller.updateNote(updateContext);

		verify(service, authorization, postContext, getContext, updateContext);
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