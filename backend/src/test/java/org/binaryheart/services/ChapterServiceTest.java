package org.binaryheart.services;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import org.binaryheart.exceptions.ForbiddenException;
import org.binaryheart.repositories.ChapterRepository;
import org.binaryheart.responses.ChapterSummary;
import org.junit.jupiter.api.Test;

class ChapterServiceTest {

	@Test
	void getAllChaptersDelegates() throws Exception {
		ChapterRepository repository = mock(ChapterRepository.class);
		List<ChapterSummary> chapters = List.of(new ChapterSummary(1, "National"));
		expect(repository.getAllChapters()).andReturn(chapters);
		replay(repository);
		ChapterService service = new ChapterService(repository);

		assertSame(chapters, service.getAllChapters());

		verify(repository);
	}

	@Test
	void getNationalChapterIdDelegates() throws Exception {
		ChapterRepository repository = mock(ChapterRepository.class);
		expect(repository.getNationalChapterId()).andReturn(1);
		replay(repository);
		ChapterService service = new ChapterService(repository);

		assertEquals(1, service.getNationalChapterId());

		verify(repository);
	}

	@Test
	void getChapterIdByNameDelegates() throws Exception {
		ChapterRepository repository = mock(ChapterRepository.class);
		expect(repository.getChapterIdByName("Chapter Two")).andReturn(2);
		replay(repository);
		ChapterService service = new ChapterService(repository);

		assertEquals(2, service.getChapterIdByName("Chapter Two"));

		verify(repository);
	}

	@Test
	void createChapterTrimsNameAndDelegates() throws Exception {
		ChapterRepository repository = mock(ChapterRepository.class);
		ChapterSummary created = new ChapterSummary(2, "Chapter Two");
		expect(repository.createChapter("Chapter Two")).andReturn(created);
		replay(repository);
		ChapterService service = new ChapterService(repository);

		assertSame(created, service.createChapter(" Chapter Two "));

		verify(repository);
	}

	@Test
	void deleteChapterDelegates() throws Exception {
		ChapterRepository repository = mock(ChapterRepository.class);
		repository.deleteChapter(2);
		replay(repository);
		ChapterService service = new ChapterService(repository);

		service.deleteChapter(2, 1, List.of(1));

		verify(repository);
	}

	@Test
	void resolveChapterIdsReturnsNullForNationalAccess() throws Exception {
		ChapterRepository repository = mock(ChapterRepository.class);
		expect(repository.getNationalChapterId()).andReturn(1);
		replay(repository);
		ChapterService service = new ChapterService(repository);

		assertNull(service.resolveChapterIds(List.of(), List.of(1)));

		verify(repository);
	}

	@Test
	void resolveChapterIdsReturnsLocalChaptersForLocalAccess() throws Exception {
		ChapterRepository repository = mock(ChapterRepository.class);
		expect(repository.getNationalChapterId()).andReturn(1);
		replay(repository);
		ChapterService service = new ChapterService(repository);

		assertEquals(List.of(2), service.resolveChapterIds(List.of(), List.of(2)));

		verify(repository);
	}

	@Test
	void resolveChapterIdReturnsRequestedChapterForNationalAccess() throws Exception {
		ChapterRepository repository = mock(ChapterRepository.class);
		expect(repository.getNationalChapterId()).andReturn(1);
		replay(repository);
		ChapterService service = new ChapterService(repository);

		assertEquals(List.of(3), service.resolveChapterIds(3, List.of(1)));

		verify(repository);
	}

	@Test
	void resolveChapterIdReturnsRequestedLocalChapter() throws Exception {
		ChapterRepository repository = mock(ChapterRepository.class);
		expect(repository.getNationalChapterId()).andReturn(1);
		replay(repository);
		ChapterService service = new ChapterService(repository);

		assertEquals(List.of(2), service.resolveChapterIds(2, List.of(2)));

		verify(repository);
	}

	@Test
	void resolveChapterIdsRejectsUnauthorizedChapter() throws Exception {
		ChapterRepository repository = mock(ChapterRepository.class);
		expect(repository.getNationalChapterId()).andReturn(1);
		replay(repository);

		assertThrows(ForbiddenException.class,
			() -> new ChapterService(repository).resolveChapterIds(List.of(3), List.of(2)));

		verify(repository);
	}

	@Test
	void deleteChapterRejectsNationalChapter() {
		ChapterRepository repository = mock(ChapterRepository.class);
		replay(repository);
		ChapterService service = new ChapterService(repository);

		assertThrows(IllegalArgumentException.class, () -> service.deleteChapter(1, 1, List.of(1)));

		verify(repository);
	}

	@Test
	void deleteChapterRejectsNonNationalRequester() {
		ChapterRepository repository = mock(ChapterRepository.class);
		replay(repository);
		ChapterService service = new ChapterService(repository);

		assertThrows(IllegalArgumentException.class, () -> service.deleteChapter(2, 1, List.of(2)));

		verify(repository);
	}
}