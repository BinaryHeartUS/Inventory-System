package org.binaryheart.services;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;

import org.binaryheart.repositories.NoteRepository;
import org.binaryheart.responses.NoteResponse;
import org.junit.jupiter.api.Test;

class NoteServiceTest {

	@Test
	void everyOperationDelegatesToRepository() throws Exception {
		NoteRepository repository = mock(NoteRepository.class);
		NoteResponse note = new NoteResponse(3, "text", "today", 42);
		NoteResponse[] notes = {note};
		expect(repository.addNote(42, "text")).andReturn(note);
		expect(repository.getNotes(42)).andReturn(notes);
		expect(repository.getAssetChapterId(42)).andReturn(7);
		repository.updateNote(42, 3, "updated");
		replay(repository);
		NoteService service = new NoteService(repository);

		assertSame(note, service.addNote(42, "text"));
		assertSame(notes, service.getNotes(42));
		assertEquals(7, service.getAssetChapterId(42));
		service.updateNote(42, 3, "updated");

		verify(repository);
	}
}