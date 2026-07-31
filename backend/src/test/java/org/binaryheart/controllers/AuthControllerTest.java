package org.binaryheart.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import io.javalin.http.Context;
import java.util.List;
import org.binaryheart.models.ChapterRole;
import org.binaryheart.requests.LoginRequest;
import org.binaryheart.responses.LoginResponse;
import org.binaryheart.services.AuthService;
import org.junit.jupiter.api.Test;

class AuthControllerTest {

	@Test
	void rejectsMissingCredentialsWithoutCallingService() {
		AuthService service = mock(AuthService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(LoginRequest.class)).andReturn(new LoginRequest("", "password", null));
		expectResult(context, 400, "Username and password are required");
		replay(service, context);

		new AuthController(service).login(context);

		verify(service, context);
	}

	@Test
	void mapsInvalidAndValidCredentials() throws Exception {
		AuthService service = mock(AuthService.class);
		Context invalid = mock(Context.class);
		Context valid = mock(Context.class);
		LoginRequest request = new LoginRequest("user", "password", null);
		LoginResponse response = new LoginResponse("token", "user", List.of(new ChapterRole(2, "Editor")), "Editor");
		expect(invalid.bodyAsClass(LoginRequest.class)).andReturn(request);
		expect(service.login("user", "password")).andReturn(null).andReturn(response);
		expectResult(invalid, 401, "Invalid credentials");
		expect(valid.bodyAsClass(LoginRequest.class)).andReturn(request);
		expectJson(valid, 200, response);
		replay(service, invalid, valid);

		AuthController controller = new AuthController(service);
		controller.login(invalid);
		controller.login(valid);

		verify(service, invalid, valid);
	}

	private void expectResult(Context context, int status, String result) {
		expect(context.status(status)).andReturn(context);
		expect(context.result(result)).andReturn(context);
	}

	private void expectJson(Context context, int status, Object body) {
		expect(context.status(status)).andReturn(context);
		expect(context.json(body)).andReturn(context);
	}
}