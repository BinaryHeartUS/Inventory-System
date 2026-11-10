package org.binaryheart.services;

import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.easymock.EasyMock.expect;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import io.javalin.http.ForbiddenResponse;
import java.util.List;
import org.binaryheart.models.ChapterRole;
import org.junit.jupiter.api.Test;

class AuthorizationServiceTest {

	@org.junit.jupiter.params.ParameterizedTest
	@org.junit.jupiter.params.provider.ValueSource(
		strings = {"Chapter Admin", "Inventory Admin", "Admin"})
	void mutationScopeNeverIncludesViewerOrEditorChaptersForDeletion(String adminRole) throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		expect(chapters.getNationalChapterId()).andReturn(1).times(2);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);
		List<ChapterRole> roles = List.of(new ChapterRole(2, adminRole), new ChapterRole(3, "Viewer"),
			new ChapterRole(1, "Viewer"), new ChapterRole(4, "Editor"));

		assertEquals(List.of(2), service.mutationChapterIds(roles, true));
		assertEquals(List.of(2, 4), service.mutationChapterIds(roles, false));
		verify(chapters);
	}

	@org.junit.jupiter.params.ParameterizedTest
	@org.junit.jupiter.params.provider.ValueSource(
		strings = {"Admin", "Chapter Admin", "Inventory Admin"})
	void nationalAdministrativeAssignmentCoversAllChapters(String role) throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		assertNull(new AuthorizationService(chapters).mutationChapterIds(List.of(new ChapterRole(1, role)), true));
		verify(chapters);
	}

	@Test
	void viewerOnlyAndMissingAssignmentsCannotMutate() {
		ChapterService chapters = mock(ChapterService.class);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);
		assertThrows(ForbiddenResponse.class, () -> service.mutationChapterIds(null, false));
		assertThrows(ForbiddenResponse.class, () -> service.mutationChapterIds(List.of(), true));
		assertThrows(ForbiddenResponse.class,
			() -> service.mutationChapterIds(List.of(new ChapterRole(1, "Viewer")), false));
		assertThrows(ForbiddenResponse.class,
			() -> service.mutationChapterIds(List.of(new ChapterRole(1, "Editor")), true));
		verify(chapters);
	}

	@Test
	void inventoryAdminsWriteOnlyTheirChapterOrAllChaptersWhenNational() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		chapters.requireActive(2);
		org.easymock.EasyMock.expectLastCall().times(3);
		expect(chapters.getNationalChapterId()).andReturn(1).times(3);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		service.requireInventoryEditAccess(List.of(new ChapterRole(2, "Inventory Admin")));
		service.requireChapterEditAccess(List.of(new ChapterRole(2, "Inventory Admin")), 2);
		service.requireChapterEditAccess(List.of(new ChapterRole(1, "Inventory Admin")), 2);
		assertThrows(ForbiddenResponse.class,
			() -> service.requireChapterEditAccess(List.of(new ChapterRole(3, "Inventory Admin")), 2));
		verify(chapters);
	}

	@Test
	void inventoryEditAccessAllowsWriterFromAnyChapter() {
		ChapterService chapters = mock(ChapterService.class);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		service.requireInventoryEditAccess(List.of(new ChapterRole(7, "Editor")));

		verify(chapters);
	}

	@Test
	void inventoryEditAccessRejectsViewer() {
		ChapterService chapters = mock(ChapterService.class);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		assertThrows(ForbiddenResponse.class,
			() -> service.requireInventoryEditAccess(List.of(new ChapterRole(7, "Viewer"))));

		verify(chapters);
	}

	@Test
	void editAccessAllowsLocalWriter() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		chapters.requireActive(2);
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(chapters);
		AuthorizationService service = new AuthorizationService(chapters);

		service.requireChapterEditAccess(List.of(new ChapterRole(2, "Editor")), 2);

		verify(chapters);
	}

	@Test
	void editAccessAllowsNationalWriter() throws Exception {
		ChapterService chapters = mock(ChapterService.class);
		chapters.requireActive(9);
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
		chapters.requireActive(2);
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
		chapters.requireActive(2);
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