package org.binaryheart.services;

import static org.binaryheart.TestFixtures.tool;
import static org.binaryheart.TestFixtures.toolResponse;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.sql.SQLException;
import java.util.List;
import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.ToolNotFoundException;
import org.binaryheart.repositories.ToolRepository;
import org.binaryheart.requests.ToolListRequest;
import org.binaryheart.responses.GetToolResponse;
import org.binaryheart.responses.ToolChangelogResponse;
import org.junit.jupiter.api.Test;

class ToolServiceTest {

	@Test
	void listsReadsAndEmptyAccessAreHandled() throws Exception {
		ToolRepository repository = mock(ToolRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		ToolListRequest query = new ToolListRequest(null, null, 25, 0);
		GetToolResponse tool = toolResponse();
		expect(chapters.resolveChapterIds(2, List.of(2))).andReturn(List.of(2));
		expect(repository.getTools(List.of(2), query)).andReturn(List.of(tool));
		expect(repository.getTool(301)).andReturn(tool);
		replay(repository, chapters);
		ToolService service = new ToolService(repository, chapters);

		assertEquals(List.of(tool), service.getTools(List.of(2), 2, query));
		assertSame(tool, service.getTool(List.of(2), 301));
		assertEquals(List.of(), service.getTools(List.of(), null, query));
		assertNull(service.getTool(null, 301));

		verify(repository, chapters);
	}

	@Test
	void everyMutationAndChangelogDelegates() throws Exception {
		ToolRepository repository = mock(ToolRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		GetToolResponse tool = toolResponse();
		ToolChangelogResponse[] changelog = new ToolChangelogResponse[0];
		expect(repository.insertTool(tool(), "user")).andReturn(301);
		repository.updateTool(tool(), "user");
		expect(repository.getTool(301)).andReturn(tool).times(2);
		expect(repository.getToolChangelog(301)).andReturn(changelog);
		repository.deleteTool(301);
		replay(repository, chapters);
		ToolService service = new ToolService(repository, chapters);

		assertEquals(301, service.insertTool(tool(), "user"));
		service.updateTool(tool(), "user");
		assertSame(changelog, service.getToolChangelog(List.of(2), 301));
		service.deleteTool(List.of(2), 301);

		verify(repository, chapters);
	}

	@Test
	void mutationsTranslateSqlStatesAndRejectUnauthorizedAccess() throws Exception {
		ToolRepository repository = mock(ToolRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		expect(repository.insertTool(tool(), "user")).andThrow(sql("23505"));
		repository.updateTool(tool(), "user");
		expectLastCall().andThrow(sql("02000"));
		expect(repository.getTool(301)).andReturn(null);
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(repository, chapters);
		ToolService service = new ToolService(repository, chapters);

		assertThrows(DuplicateKeyException.class, () -> service.insertTool(tool(), "user"));
		assertThrows(ToolNotFoundException.class, () -> service.updateTool(tool(), "user"));
		assertThrows(BadArgumentException.class, () -> service.deleteTool(List.of(2), 301));

		verify(repository, chapters);
	}

	private SQLException sql(String state) {
		return new SQLException("failure", state);
	}
}