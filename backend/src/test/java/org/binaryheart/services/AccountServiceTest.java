package org.binaryheart.services;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.sql.SQLException;
import java.util.List;
import org.binaryheart.auth.PasswordService;
import org.binaryheart.auth.PasswordService.PasswordHash;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.models.ChapterRole;
import org.binaryheart.models.VolunteerCredentials;
import org.binaryheart.repositories.AccountRepository;
import org.binaryheart.repositories.AuthRepository;
import org.binaryheart.requests.AddAffiliationRequest;
import org.binaryheart.requests.CreateAccountRequest;
import org.binaryheart.requests.UpdateAffiliationRequest;
import org.binaryheart.requests.UpdatePasswordRequest;
import org.binaryheart.responses.AccountSummary;
import org.junit.jupiter.api.Test;

class AccountServiceTest {

	@Test
	void createAccountHashesPasswordAndDelegates() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		CreateAccountRequest request = new CreateAccountRequest("Name", "user", "password", 2, "Editor");
		expect(passwords.hash("password")).andReturn(new PasswordHash("hash", "salt"));
		expect(repository.createVolunteer("Name", "user", "hash", "salt", 2, "Editor")).andReturn(7);
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);

		AccountSummary created = service.createAccount(request, "Chapter Admin",
			List.of(new ChapterRole(2, "Chapter Admin")));

		assertEquals(7, created.id());
		assertEquals(List.of(new ChapterRole(2, "Editor")), created.chapterRoles());
		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void createAccountRejectsAdminOutsideNationalChapter() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		expect(chapters.getNationalChapterId()).andReturn(1);
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);

		assertThrows(IllegalArgumentException.class, () -> service
			.createAccount(new CreateAccountRequest("Name", "user", "password", 2, "Admin"), "Admin", List.of()));

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void createAccountRejectsChapterAdminRoleCreatedByChapterAdmin() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);

		assertThrows(IllegalArgumentException.class,
			() -> service.createAccount(new CreateAccountRequest("Name", "user", "password", 2, "Chapter Admin"),
				"Chapter Admin", List.of(new ChapterRole(2, "Chapter Admin"))));

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void createAccountRejectsChapterAdminOutsideTheirChapter() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);

		assertThrows(IllegalArgumentException.class,
			() -> service.createAccount(new CreateAccountRequest("Name", "user", "password", 2, "Editor"),
				"Chapter Admin", List.of(new ChapterRole(3, "Chapter Admin"))));

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void createAccountTranslatesDuplicateUsername() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		CreateAccountRequest request = new CreateAccountRequest("Name", "user", "password", 2, "Viewer");
		expect(passwords.hash("password")).andReturn(new PasswordHash("hash", "salt"));
		expect(repository.createVolunteer("Name", "user", "hash", "salt", 2, "Viewer"))
			.andThrow(new SQLException("duplicate", "23505"));
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);

		assertThrows(DuplicateKeyException.class, () -> service.createAccount(request, "Admin", List.of()));

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void getAccountsReturnsAllAccountsForAdmin() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		AccountSummary editor = account(2, "Editor");
		AccountSummary admin = account(3, "Admin");
		expect(repository.getAllVolunteers()).andReturn(List.of(editor, admin));
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);

		assertEquals(List.of(editor, admin), service.getAccounts("Admin", List.of(1)));

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void getAccountsFiltersElevatedAccountsForChapterAdmin() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		AccountSummary editor = account(2, "Editor");
		AccountSummary admin = account(3, "Admin");
		expect(repository.getVolunteersForChapters(List.of(2))).andReturn(List.of(editor, admin));
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);

		assertEquals(List.of(editor), service.getAccounts("Chapter Admin", List.of(2)));

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void deleteAccountProtectsSelf() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);

		assertThrows(IllegalArgumentException.class,
			() -> service.deleteAccount(7, 7, "Admin", List.of(new ChapterRole(1, "Admin"))));

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void deleteAccountDelegatesWithinChapterAdminScope() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		AccountSummary editor = account(8, "Editor");
		expect(repository.getAllVolunteers()).andReturn(List.of(editor));
		repository.deleteVolunteer(8);
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);

		service.deleteAccount(8, 7, "Chapter Admin", List.of(new ChapterRole(2, "Chapter Admin")));

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void updatePasswordRejectsWrongCurrentPassword() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		expect(authRepository.findByUsername("user")).andReturn(credentials());
		expect(passwords.matches("wrong", "hash", "salt")).andReturn(false);
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);

		assertThrows(IllegalArgumentException.class,
			() -> service.updatePassword(7, "user", new UpdatePasswordRequest("wrong", "new")));

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void updatePasswordStoresNewHash() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		expect(authRepository.findByUsername("user")).andReturn(credentials());
		expect(passwords.matches("current", "hash", "salt")).andReturn(true);
		expect(passwords.hash("new")).andReturn(new PasswordHash("new-hash", "new-salt"));
		repository.updatePassword(7, "new-hash", "new-salt");
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);

		service.updatePassword(7, "user", new UpdatePasswordRequest("current", "new"));

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void addAffiliationDelegates() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		repository.addAffiliation(8, 2, "Viewer");
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);
		List<ChapterRole> adminRoles = List.of(new ChapterRole(2, "Chapter Admin"));

		service.addAffiliation(8, new AddAffiliationRequest(2, "Viewer"), "Chapter Admin", adminRoles);

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void updateAffiliationDelegates() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		repository.updateAffiliation(8, 2, "Editor");
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);
		List<ChapterRole> adminRoles = List.of(new ChapterRole(2, "Chapter Admin"));

		service.updateAffiliation(8, 2, new UpdateAffiliationRequest("Editor"), 7, "Chapter Admin", adminRoles);

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void removeAffiliationDelegates() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		AccountSummary target = new AccountSummary(8, "target", "Target",
			List.of(new ChapterRole(2, "Editor"), new ChapterRole(3, "Viewer")));
		expect(repository.getAllVolunteers()).andReturn(List.of(target));
		repository.deleteAffiliation(8, 2);
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);
		List<ChapterRole> adminRoles = List.of(new ChapterRole(2, "Chapter Admin"));

		service.removeAffiliation(8, 2, 7, "Chapter Admin", adminRoles);

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void updateAffiliationRejectsSelfUpdate() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);

		assertThrows(IllegalArgumentException.class,
			() -> service.updateAffiliation(7, 2, new UpdateAffiliationRequest("Editor"), 7, "Admin", List.of()));

		verify(repository, authRepository, chapters, passwords);
	}

	@Test
	void removeAffiliationRejectsSelfRemoval() throws Exception {
		AccountRepository repository = mock(AccountRepository.class);
		AuthRepository authRepository = mock(AuthRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		PasswordService passwords = mock(PasswordService.class);
		replay(repository, authRepository, chapters, passwords);
		AccountService service = new AccountService(repository, authRepository, chapters, passwords);

		assertThrows(IllegalArgumentException.class, () -> service.removeAffiliation(7, 2, 7, "Admin", List.of()));

		verify(repository, authRepository, chapters, passwords);
	}

	private VolunteerCredentials credentials() {
		return new VolunteerCredentials(7, "user", "hash", "salt", List.of(new ChapterRole(2, "Editor")), "Editor");
	}

	private AccountSummary account(int id, String role) {
		return new AccountSummary(id, "user" + id, "Name", List.of(new ChapterRole(2, role)));
	}
}