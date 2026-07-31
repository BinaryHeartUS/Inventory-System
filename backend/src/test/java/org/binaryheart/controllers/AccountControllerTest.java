package org.binaryheart.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

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
	void rejectsMissingCreateFieldsAndOtherUsersPassword() {
		AccountService service = mock(AccountService.class);
		Context create = mock(Context.class);
		Context password = mock(Context.class);
		expect(create.bodyAsClass(CreateAccountRequest.class))
			.andReturn(new CreateAccountRequest("", "user", "password", 2, "Editor"));
		expectResult(create, 400, "Name, username, and password are required");
		expect(password.pathParam("id")).andReturn("8");
		expect(password.<Integer>attribute("volunteerId")).andReturn(7);
		expectResult(password, 403, "You may only change your own password");
		replay(service, create, password);
		AccountController controller = new AccountController(service);

		controller.createAccount(create);
		controller.updatePassword(password);

		verify(service, create, password);
	}

	@Test
	void rejectsBlankNewPasswordAndDelegatesValidPassword() throws Exception {
		AccountService service = mock(AccountService.class);
		Context blank = mock(Context.class);
		Context valid = mock(Context.class);
		UpdatePasswordRequest blankRequest = new UpdatePasswordRequest("current", " ");
		UpdatePasswordRequest validRequest = new UpdatePasswordRequest("current", "new");
		expectOwnPasswordContext(blank, blankRequest);
		expectResult(blank, 400, "New password is required");
		expectOwnPasswordContext(valid, validRequest);
		expect(valid.<String>attribute("username")).andReturn("user");
		service.updatePassword(7, "user", validRequest);
		expectStatus(valid, 204);
		replay(service, blank, valid);
		AccountController controller = new AccountController(service);

		controller.updatePassword(blank);
		controller.updatePassword(valid);

		verify(service, blank, valid);
	}

	@Test
	void handlersForwardAuthenticatedContext() throws Exception {
		AccountService service = mock(AccountService.class);
		Context list = mock(Context.class);
		Context add = mock(Context.class);
		Context update = mock(Context.class);
		Context remove = mock(Context.class);
		List<ChapterRole> roles = List.of(new ChapterRole(2, "Chapter Admin"));
		List<AccountSummary> accounts = List.of(new AccountSummary(8, "target", "Target", roles));
		expect(list.<String>attribute("role")).andReturn("Chapter Admin");
		expect(list.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(service.getAccounts("Chapter Admin", List.of(2))).andReturn(accounts);
		expectJson(list, 200, accounts);
		AddAffiliationRequest addRequest = new AddAffiliationRequest(2, "Viewer");
		expect(add.pathParam("id")).andReturn("8");
		expect(add.bodyAsClass(AddAffiliationRequest.class)).andReturn(addRequest);
		expect(add.<String>attribute("role")).andReturn("Chapter Admin");
		expect(add.<List<ChapterRole>>attribute("chapterRoles")).andReturn(roles);
		service.addAffiliation(8, addRequest, "Chapter Admin", roles);
		expectStatus(add, 204);
		UpdateAffiliationRequest updateRequest = new UpdateAffiliationRequest("Editor");
		expectAffiliationContext(update, updateRequest, roles);
		service.updateAffiliation(8, 2, updateRequest, 7, "Chapter Admin", roles);
		expectStatus(update, 204);
		expectRemoveAffiliationContext(remove, roles);
		service.removeAffiliation(8, 2, 7, "Chapter Admin", roles);
		expectStatus(remove, 204);
		replay(service, list, add, update, remove);
		AccountController controller = new AccountController(service);

		controller.getAccounts(list);
		controller.addAffiliation(add);
		controller.updateAffiliation(update);
		controller.removeAffiliation(remove);

		verify(service, list, add, update, remove);
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