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
	void listsAndReadsEnforceChapterScope() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PartListRequest query = new PartListRequest(null, null, null, false, null, 25, 0);
		PartResponse part = partResponse();
		PartResponse other = new PartResponse(202, "RAM", "other", true, null, 3, null, null, null);
		expect(chapters.resolveChapterIds(2, List.of(2))).andReturn(List.of(2)).times(2);
		expect(repository.getParts(List.of(2), query)).andReturn(new PartResponse[]{part});
		List<PartTypeCountResponse> counts = List.of(new PartTypeCountResponse("RAM", 1));
		expect(repository.getPartTypeCounts(List.of(2), query)).andReturn(counts);
		expect(repository.getPart(201)).andReturn(part);
		expect(repository.getPartsByDevice(101)).andReturn(new PartResponse[]{part, other});
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertArrayEquals(new PartResponse[]{part}, service.getParts(List.of(2), 2, query));
		assertSame(counts, service.getPartTypeCounts(List.of(2), 2, query));
		assertSame(part, service.getPart(List.of(2), 201));
		assertArrayEquals(new PartResponse[]{part}, service.getPartsByDevice(List.of(2), 101));
		assertEquals(0, service.getParts(List.of(), null, query).length);
		assertEquals(List.of(), service.getPartTypeCounts(null, null, query));
		assertNull(service.getPart(List.of(), 201));
		assertEquals(0, service.getPartsByDevice(null, 101).length);

		verify(repository, chapters);
	}

	@Test
	void everyMutationAndChangelogDelegates() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PartResponse part = partResponse();
		PartChangelogResponse[] changelog = new PartChangelogResponse[0];
		expect(repository.getPart(201)).andReturn(part).times(2);
		repository.deletePart(201, "user");
		repository.updatePart(part(), "user");
		expect(repository.insertPart(part(), "user")).andReturn(201);
		expect(repository.getPartChangelog(201)).andReturn(changelog);
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		service.deletePart(List.of(2), 201, "user");
		service.updatePart(part(), "user");
		assertEquals(201, service.insertPart(part(), "user"));
		assertSame(changelog, service.getPartChangelog(List.of(2), 201));

		verify(repository, chapters);
	}

	@Test
	void mutationsTranslateSqlStatesAndRejectUnauthorizedAccess() throws Exception {
		PartRepository repository = mock(PartRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		expect(repository.getPart(201)).andReturn(null);
		expect(chapters.getNationalChapterId()).andReturn(1);
		repository.updatePart(part(), "user");
		expectLastCall().andThrow(sql("02000"));
		expect(repository.insertPart(part(), "user")).andThrow(sql("23505"));
		replay(repository, chapters);
		PartService service = new PartService(repository, chapters);

		assertThrows(InvalidParameterException.class, () -> service.deletePart(List.of(2), 201, "user"));
		assertThrows(PartNotFoundException.class, () -> service.updatePart(part(), "user"));
		assertThrows(DuplicateKeyException.class, () -> service.insertPart(part(), "user"));

		verify(repository, chapters);
	}

	private SQLException sql(String state) {
		return new SQLException("failure", state);
	}
}