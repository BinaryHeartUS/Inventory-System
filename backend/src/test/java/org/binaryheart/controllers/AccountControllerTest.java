package org.binaryheart.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import io.javalin.Javalin;
import io.javalin.http.Context;
import java.util.List;
import org.binaryheart.models.ChapterRole;
import org.binaryheart.requests.AddAffiliationRequest;
import org.binaryheart.requests.CreateAccountRequest;
import org.binaryheart.requests.UpdateAffiliationRequest;
import org.binaryheart.requests.UpdatePasswordRequest;
import org.binaryheart.responses.AccountSummary;
import org.binaryheart.services.AccountService;
import org.junit.jupiter.api.Test;

class AccountControllerTest {

	@Test
	void registerRoutesDefinesEndpoints() {
		AccountService service = mock(AccountService.class);
		replay(service);

		assertDoesNotThrow(
			() -> Javalin.create(config -> config.routes.apiBuilder(new AccountController(service)::registerRoutes)));

		verify(service);
	}

	@Test
	void createAccountRejectsMissingFields() {
		AccountService service = mock(AccountService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(CreateAccountRequest.class))
			.andReturn(new CreateAccountRequest("", "user", "password", 2, "Editor"));
		expectResult(context, 400, "Name, username, and password are required");
		replay(service, context);

		new AccountController(service).createAccount(context);

		verify(service, context);
	}

	@Test
	void updatePasswordRejectsOtherUsersPassword() {
		AccountService service = mock(AccountService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("8");
		expect(context.<Integer>attribute("volunteerId")).andReturn(7);
		expectResult(context, 403, "You may only change your own password");
		replay(service, context);

		new AccountController(service).updatePassword(context);

		verify(service, context);
	}

	@Test
	void updatePasswordRejectsBlankNewPassword() {
		AccountService service = mock(AccountService.class);
		Context context = mock(Context.class);
		UpdatePasswordRequest blankRequest = new UpdatePasswordRequest("current", " ");
		expectOwnPasswordContext(context, blankRequest);
		expectResult(context, 400, "New password is required");
		replay(service, context);

		new AccountController(service).updatePassword(context);

		verify(service, context);
	}

	@Test
	void updatePasswordDelegatesValidPassword() throws Exception {
		AccountService service = mock(AccountService.class);
		Context context = mock(Context.class);
		UpdatePasswordRequest request = new UpdatePasswordRequest("current", "new");
		expectOwnPasswordContext(context, request);
		expect(context.<String>attribute("username")).andReturn("user");
		service.updatePassword(7, "user", request);
		expectStatus(context, 204);
		replay(service, context);

		new AccountController(service).updatePassword(context);

		verify(service, context);
	}

	@Test
	void deleteAccountForwardsAuthenticatedContext() throws Exception {
		AccountService service = mock(AccountService.class);
		Context context = mock(Context.class);
		List<ChapterRole> roles = List.of(new ChapterRole(1, "Admin"));
		expect(context.pathParam("id")).andReturn("8");
		expect(context.<Integer>attribute("volunteerId")).andReturn(7);
		expect(context.<String>attribute("role")).andReturn("Admin");
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(roles);
		service.deleteAccount(8, 7, "Admin", roles);
		expectStatus(context, 204);
		replay(service, context);

		new AccountController(service).deleteAccount(context);

		verify(service, context);
	}

	@Test
	void getAccountsForwardsAuthenticatedContext() throws Exception {
		AccountService service = mock(AccountService.class);
		Context context = mock(Context.class);
		List<ChapterRole> roles = List.of(new ChapterRole(2, "Chapter Admin"));
		List<AccountSummary> accounts = List.of(new AccountSummary(8, "target", "Target", roles));
		expect(context.<String>attribute("role")).andReturn("Chapter Admin");
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(service.getAccounts("Chapter Admin", List.of(2))).andReturn(accounts);
		expectJson(context, 200, accounts);
		replay(service, context);

		new AccountController(service).getAccounts(context);

		verify(service, context);
	}

	@Test
	void addAffiliationForwardsAuthenticatedContext() throws Exception {
		AccountService service = mock(AccountService.class);
		Context context = mock(Context.class);
		List<ChapterRole> roles = List.of(new ChapterRole(2, "Chapter Admin"));
		AddAffiliationRequest addRequest = new AddAffiliationRequest(2, "Viewer");
		expect(context.pathParam("id")).andReturn("8");
		expect(context.bodyAsClass(AddAffiliationRequest.class)).andReturn(addRequest);
		expect(context.<String>attribute("role")).andReturn("Chapter Admin");
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(roles);
		service.addAffiliation(8, addRequest, "Chapter Admin", roles);
		expectStatus(context, 204);
		replay(service, context);

		new AccountController(service).addAffiliation(context);

		verify(service, context);
	}

	@Test
	void updateAffiliationForwardsAuthenticatedContext() throws Exception {
		AccountService service = mock(AccountService.class);
		Context context = mock(Context.class);
		List<ChapterRole> roles = List.of(new ChapterRole(2, "Chapter Admin"));
		UpdateAffiliationRequest updateRequest = new UpdateAffiliationRequest("Editor");
		expectAffiliationContext(context, updateRequest, roles);
		service.updateAffiliation(8, 2, updateRequest, 7, "Chapter Admin", roles);
		expectStatus(context, 204);
		replay(service, context);

		new AccountController(service).updateAffiliation(context);

		verify(service, context);
	}

	@Test
	void removeAffiliationForwardsAuthenticatedContext() throws Exception {
		AccountService service = mock(AccountService.class);
		Context context = mock(Context.class);
		List<ChapterRole> roles = List.of(new ChapterRole(2, "Chapter Admin"));
		expectRemoveAffiliationContext(context, roles);
		service.removeAffiliation(8, 2, 7, "Chapter Admin", roles);
		expectStatus(context, 204);
		replay(service, context);

		new AccountController(service).removeAffiliation(context);

		verify(service, context);
	}

	private void expectOwnPasswordContext(Context context, UpdatePasswordRequest request) {
		expect(context.pathParam("id")).andReturn("7");
		expect(context.<Integer>attribute("volunteerId")).andReturn(7);
		expect(context.bodyAsClass(UpdatePasswordRequest.class)).andReturn(request);
	}

	private void expectAffiliationContext(Context context, UpdateAffiliationRequest request, List<ChapterRole> roles) {
		expect(context.pathParam("id")).andReturn("8");
		expect(context.pathParam("chapterId")).andReturn("2");
		expect(context.bodyAsClass(UpdateAffiliationRequest.class)).andReturn(request);
		expect(context.<Integer>attribute("volunteerId")).andReturn(7);
		expect(context.<String>attribute("role")).andReturn("Chapter Admin");
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(roles);
	}

	private void expectRemoveAffiliationContext(Context context, List<ChapterRole> roles) {
		expect(context.pathParam("id")).andReturn("8");
		expect(context.pathParam("chapterId")).andReturn("2");
		expect(context.<Integer>attribute("volunteerId")).andReturn(7);
		expect(context.<String>attribute("role")).andReturn("Chapter Admin");
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(roles);
	}

	private void expectStatus(Context context, int status) {
		expect(context.status(status)).andReturn(context);
	}

	private void expectResult(Context context, int status, String result) {
		expectStatus(context, status);
		expect(context.result(result)).andReturn(context);
	}

	private void expectJson(Context context, int status, Object body) {
		expectStatus(context, status);
		expect(context.json(body)).andReturn(context);
	}
}