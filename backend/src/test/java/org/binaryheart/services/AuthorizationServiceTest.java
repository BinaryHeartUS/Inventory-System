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
	void editAccessAllowsLocalWriterAndNationalWriter() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		Context localContext = contextWithRoles(List.of(new ChapterRole(2, "Editor")));
		Context nationalContext = contextWithRoles(List.of(new ChapterRole(1, "Admin")));
		expect(chapters.getNationalChapterId()).andReturn(1).times(2);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		service.requireChapterEditAccess(localContext, 2);
		service.requireChapterEditAccess(nationalContext, 9);

		verify(chapters, localContext, nationalContext);
	}

	@Test
	void editAccessRejectsMissingRolesViewerAndWrongChapter() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		Context missingContext = contextWithRoles(List.of());
		Context viewerContext = contextWithRoles(List.of(new ChapterRole(2, "Viewer")));
		Context wrongContext = contextWithRoles(List.of(new ChapterRole(3, "Editor")));
		expect(chapters.getNationalChapterId()).andReturn(1).times(2);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		assertThrows(ForbiddenResponse.class, () -> service.requireChapterEditAccess(missingContext, 2));
		assertThrows(ForbiddenResponse.class, () -> service.requireChapterEditAccess(viewerContext, 2));
		assertThrows(ForbiddenResponse.class, () -> service.requireChapterEditAccess(wrongContext, 2));

		verify(chapters, missingContext, viewerContext, wrongContext);
	}

	@Test
	void readAccessAllowsAnyLocalOrNationalRoleAndRejectsOthers() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		Context localContext = contextWithRoles(List.of(new ChapterRole(2, "Viewer")));
		Context nationalContext = contextWithRoles(List.of(new ChapterRole(1, "Viewer")));
		Context wrongContext = contextWithRoles(List.of(new ChapterRole(3, "Viewer")));
		expect(chapters.getNationalChapterId()).andReturn(1).times(3);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		service.requireChapterReadAccess(localContext, 2);
		service.requireChapterReadAccess(nationalContext, 9);
		assertThrows(ForbiddenResponse.class, () -> service.requireChapterReadAccess(wrongContext, 2));

		verify(chapters, localContext, nationalContext, wrongContext);
	}

	private Context contextWithRoles(List<ChapterRole> roles) {
		Context context = mock(Context.class);
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(roles);
		replay(context);
		return context;
	}
}