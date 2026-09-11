package org.binaryheart.services;

import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.easymock.EasyMock.expect;
import static org.junit.jupiter.api.Assertions.assertThrows;

import io.javalin.http.ForbiddenResponse;
import java.util.List;
import org.binaryheart.models.ChapterRole;
import org.junit.jupiter.api.Test;

class AuthorizationServiceTest {

	@Test
	void editAccessAllowsLocalWriter() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		service.requireChapterEditAccess(List.of(new ChapterRole(2, "Editor")), 2);

		verify(chapters);
	}

	@Test
	void editAccessAllowsNationalWriter() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		service.requireChapterEditAccess(List.of(new ChapterRole(1, "Admin")), 9);

		verify(chapters);
	}

	@Test
	void editAccessRejectsMissingRoles() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		assertThrows(ForbiddenResponse.class, () -> service.requireChapterEditAccess(List.of(), 2));

		verify(chapters);
	}

	@Test
	void editAccessRejectsViewer() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		assertThrows(ForbiddenResponse.class,
			() -> service.requireChapterEditAccess(List.of(new ChapterRole(2, "Viewer")), 2));

		verify(chapters);
	}

	@Test
	void editAccessRejectsWrongChapter() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		assertThrows(ForbiddenResponse.class,
			() -> service.requireChapterEditAccess(List.of(new ChapterRole(3, "Editor")), 2));

		verify(chapters);
	}

	@Test
	void readAccessAllowsLocalRole() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		service.requireChapterReadAccess(List.of(new ChapterRole(2, "Viewer")), 2);

		verify(chapters);
	}

	@Test
	void readAccessAllowsNationalRole() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		service.requireChapterReadAccess(List.of(new ChapterRole(1, "Viewer")), 9);

		verify(chapters);
	}

	@Test
	void readAccessRejectsWrongChapter() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		assertThrows(ForbiddenResponse.class,
			() -> service.requireChapterReadAccess(List.of(new ChapterRole(3, "Viewer")), 2));

		verify(chapters);
	}
}