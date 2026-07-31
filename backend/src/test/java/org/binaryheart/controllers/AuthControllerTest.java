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
import org.binaryheart.requests.LoginRequest;
import org.binaryheart.responses.LoginResponse;
import org.binaryheart.services.AuthenticationService;
import org.junit.jupiter.api.Test;

class AuthControllerTest {

	@Test
	void registerRoutesDefinesEndpoints() {
		AuthenticationService service = mock(AuthenticationService.class);
		replay(service);

		assertDoesNotThrow(
			() -> Javalin.create(config -> config.routes.apiBuilder(new AuthController(service)::registerRoutes)));

		verify(service);
	}

	@Test
	void rejectsMissingCredentialsWithoutCallingService() {
		AuthenticationService service = mock(AuthenticationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(LoginRequest.class)).andReturn(new LoginRequest("", "password", null));
		expectResult(context, 400, "Username and password are required");
		replay(service, context);

		new AuthController(service).login(context);

		verify(service, context);
	}

	@Test
	void mapsInvalidCredentials() throws Exception {
		AuthenticationService service = mock(AuthenticationService.class);
		Context context = mock(Context.class);
		LoginRequest request = new LoginRequest("user", "password", null);
		expect(context.bodyAsClass(LoginRequest.class)).andReturn(request);
		expect(service.login("user", "password")).andReturn(null);
		expectResult(context, 401, "Invalid credentials");
		replay(service, context);

		new AuthController(service).login(context);

		verify(service, context);
	}

	@Test
	void mapsValidCredentials() throws Exception {
		AuthenticationService service = mock(AuthenticationService.class);
		Context context = mock(Context.class);
		LoginRequest request = new LoginRequest("user", "password", null);
		LoginResponse response = new LoginResponse("token", "user", List.of(new ChapterRole(2, "Editor")), "Editor");
		expect(context.bodyAsClass(LoginRequest.class)).andReturn(request);
		expect(service.login("user", "password")).andReturn(response);
		expectJson(context, 200, response);
		replay(service, context);

		new AuthController(service).login(context);

		verify(service, context);
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