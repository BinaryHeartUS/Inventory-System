package org.binaryheart.services;

import static org.binaryheart.TestFixtures.part;
import static org.binaryheart.TestFixtures.partResponse;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.security.InvalidParameterException;
import java.sql.SQLException;
import java.util.List;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.PartNotFoundException;
import org.binaryheart.repositories.PartRepository;
import org.binaryheart.requests.PartListRequest;
import org.binaryheart.responses.PartChangelogResponse;
import org.binaryheart.responses.PartResponse;
import org.binaryheart.responses.PartTypeCountResponse;
import org.junit.jupiter.api.Test;

class PartServiceTest {

	@Test
	void getPartsDelegatesWithResolvedChapter() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PartListRequest query = new PartListRequest(null, null, null, false, null, 25, 0);
		PartResponse part = partResponse();
		expect(chapters.resolveChapterIds(2, List.of(2))).andReturn(List.of(2));
		expect(repository.getParts(List.of(2), query)).andReturn(new PartResponse[]{part});
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertArrayEquals(new PartResponse[]{part}, service.getParts(List.of(2), 2, query));

		verify(repository, chapters);
	}

	@Test
	void getPartTypeCountsDelegatesWithResolvedChapter() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PartListRequest query = new PartListRequest(null, null, null, false, null, 25, 0);
		List<PartTypeCountResponse> counts = List.of(new PartTypeCountResponse("RAM", 1));
		expect(chapters.resolveChapterIds(2, List.of(2))).andReturn(List.of(2));
		expect(repository.getPartTypeCounts(List.of(2), query)).andReturn(counts);
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertSame(counts, service.getPartTypeCounts(List.of(2), 2, query));

		verify(repository, chapters);
	}

	@Test
	void getPartReturnsAuthorizedPart() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PartResponse part = partResponse();
		expect(repository.getPart(201)).andReturn(part);
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertSame(part, service.getPart(List.of(2), 201));

		verify(repository, chapters);
	}

	@Test
	void getPartsByDeviceFiltersToAuthorizedChapters() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PartResponse part = partResponse();
		PartResponse other = new PartResponse(202, "RAM", "other", true, null, 3, null, null, null);
		expect(repository.getPartsByDevice(101)).andReturn(new PartResponse[]{part, other});
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertArrayEquals(new PartResponse[]{part}, service.getPartsByDevice(List.of(2), 101));

		verify(repository, chapters);
	}

	@Test
	void getPartsShortCircuitsEmptyAccess() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PartListRequest query = new PartListRequest(null, null, null, false, null, 25, 0);
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertEquals(0, service.getParts(List.of(), null, query).length);

		verify(repository, chapters);
	}

	@Test
	void getPartTypeCountsShortCircuitsNullAccess() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PartListRequest query = new PartListRequest(null, null, null, false, null, 25, 0);
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertEquals(List.of(), service.getPartTypeCounts(null, null, query));

		verify(repository, chapters);
	}

	@Test
	void getPartReturnsNullForEmptyAccess() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertNull(service.getPart(List.of(), 201));

		verify(repository, chapters);
	}

	@Test
	void getPartsByDeviceReturnsEmptyForNullAccess() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertEquals(0, service.getPartsByDevice(null, 101).length);

		verify(repository, chapters);
	}

	@Test
	void deletePartDelegatesForAuthorizedPart() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PartResponse part = partResponse();
		expect(repository.getPart(201)).andReturn(part);
		repository.deletePart(201, "user");
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		service.deletePart(List.of(2), 201, "user");

		verify(repository, chapters);
	}

	@Test
	void updatePartDelegates() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		repository.updatePart(part(), "user");
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		service.updatePart(part(), "user");

		verify(repository, chapters);
	}

	@Test
	void insertPartDelegates() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		expect(repository.insertPart(part(), "user")).andReturn(201);
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertEquals(201, service.insertPart(part(), "user"));

		verify(repository, chapters);
	}

	@Test
	void getPartChangelogDelegatesForAuthorizedPart() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PartResponse part = partResponse();
		PartChangelogResponse[] changelog = new PartChangelogResponse[0];
		expect(repository.getPart(201)).andReturn(part);
		expect(repository.getPartChangelog(201)).andReturn(changelog);
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertSame(changelog, service.getPartChangelog(List.of(2), 201));

		verify(repository, chapters);
	}

	@Test
	void deletePartRejectsUnauthorizedAccess() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		expect(repository.getPart(201)).andReturn(null);
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertThrows(InvalidParameterException.class, () -> service.deletePart(List.of(2), 201, "user"));

		verify(repository, chapters);
	}

	@Test
	void updatePartTranslatesMissingSqlState() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		repository.updatePart(part(), "user");
		expectLastCall().andThrow(sql("02000"));
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertThrows(PartNotFoundException.class, () -> service.updatePart(part(), "user"));

		verify(repository, chapters);
	}

	@Test
	void insertPartTranslatesDuplicateSqlState() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		expect(repository.insertPart(part(), "user")).andThrow(sql("23505"));
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertThrows(DuplicateKeyException.class, () -> service.insertPart(part(), "user"));

		verify(repository, chapters);
	}

	private SQLException sql(String state) {
		return new SQLException("failure", state);
	}
}