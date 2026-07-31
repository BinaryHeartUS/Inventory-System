package org.binaryheart.services;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertThrows;

import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import java.util.List;
import org.binaryheart.models.ChapterRole;
import org.junit.jupiter.api.Test;

class AuthorizationServiceTest {

	@Test
	void editAccessAllowsLocalWriter() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		Context localContext = contextWithRoles(List.of(new ChapterRole(2, "Editor")));
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		service.requireChapterEditAccess(localContext, 2);

		verify(chapters, localContext);
	}

	@Test
	void editAccessAllowsNationalWriter() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		Context nationalContext = contextWithRoles(List.of(new ChapterRole(1, "Admin")));
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		service.requireChapterEditAccess(nationalContext, 9);

		verify(chapters, nationalContext);
	}

	@Test
	void editAccessRejectsMissingRoles() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		Context missingContext = contextWithRoles(List.of());
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		assertThrows(ForbiddenResponse.class, () -> service.requireChapterEditAccess(missingContext, 2));

		verify(chapters, missingContext);
	}

	@Test
	void editAccessRejectsViewer() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		Context viewerContext = contextWithRoles(List.of(new ChapterRole(2, "Viewer")));
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		assertThrows(ForbiddenResponse.class, () -> service.requireChapterEditAccess(viewerContext, 2));

		verify(chapters, viewerContext);
	}

	@Test
	void editAccessRejectsWrongChapter() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		Context wrongContext = contextWithRoles(List.of(new ChapterRole(3, "Editor")));
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		assertThrows(ForbiddenResponse.class, () -> service.requireChapterEditAccess(wrongContext, 2));

		verify(chapters, wrongContext);
	}

	@Test
	void readAccessAllowsLocalRole() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		Context localContext = contextWithRoles(List.of(new ChapterRole(2, "Viewer")));
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		service.requireChapterReadAccess(localContext, 2);

		verify(chapters, localContext);
	}

	@Test
	void readAccessAllowsNationalRole() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		Context nationalContext = contextWithRoles(List.of(new ChapterRole(1, "Viewer")));
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		service.requireChapterReadAccess(nationalContext, 9);

		verify(chapters, nationalContext);
	}

	@Test
	void readAccessRejectsWrongChapter() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		Context wrongContext = contextWithRoles(List.of(new ChapterRole(3, "Viewer")));
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		assertThrows(ForbiddenResponse.class, () -> service.requireChapterReadAccess(wrongContext, 2));

		verify(chapters, wrongContext);
	}

	private Context contextWithRoles(List<ChapterRole> roles) {
		Context context = mock(Context.class);
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(roles);
		replay(context);
		return context;
	}
}