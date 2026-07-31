package org.binaryheart.services;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.security.NoSuchAlgorithmException;
import java.util.List;
import org.binaryheart.auth.PasswordService;
import org.binaryheart.auth.TokenService;
import org.binaryheart.models.ChapterRole;
import org.binaryheart.models.VolunteerCredentials;
import org.binaryheart.repositories.AuthRepository;
import org.binaryheart.responses.LoginResponse;
import org.junit.jupiter.api.Test;

class AuthenticationServiceTest {

	@Test
	void loginReturnsNullForUnknownUser() throws Exception {
		AuthRepository repository = mock(AuthRepository.class);
		PasswordService passwords = mock(PasswordService.class);
		TokenService tokens = mock(TokenService.class);
		expect(repository.findByUsername("missing")).andReturn(null);
		replay(repository, passwords, tokens);
		AuthenticationService service = new AuthenticationService(repository, passwords, tokens);

		assertNull(service.login("missing", "password"));

		verify(repository, passwords, tokens);
	}

	@Test
	void loginReturnsNullForWrongPassword() throws Exception {
		AuthRepository repository = mock(AuthRepository.class);
		PasswordService passwords = mock(PasswordService.class);
		TokenService tokens = mock(TokenService.class);
		expect(repository.findByUsername("user")).andReturn(credentials());
		expect(passwords.matches("wrong", "hash", "salt")).andReturn(false);
		replay(repository, passwords, tokens);
		AuthenticationService service = new AuthenticationService(repository, passwords, tokens);

		assertNull(service.login("user", "wrong"));

		verify(repository, passwords, tokens);
	}

	@Test
	void loginReturnsTokenForValidCredentials() throws Exception {
		AuthRepository repository = mock(AuthRepository.class);
		PasswordService passwords = mock(PasswordService.class);
		TokenService tokens = mock(TokenService.class);
		VolunteerCredentials credentials = credentials();
		expect(repository.findByUsername("user")).andReturn(credentials);
		expect(passwords.matches("correct", "hash", "salt")).andReturn(true);
		expect(tokens.create(7, "user", credentials.chapterRoles(), "Editor")).andReturn("token");
		replay(repository, passwords, tokens);
		AuthenticationService service = new AuthenticationService(repository, passwords, tokens);

		LoginResponse response = service.login("user", "correct");
		assertEquals("token", response.token());
		assertEquals("user", response.username());
		assertEquals("Editor", response.role());

		verify(repository, passwords, tokens);
	}

	@Test
	void loginReturnsNullWhenPasswordHashingFails() throws Exception {
		AuthRepository repository = mock(AuthRepository.class);
		PasswordService passwords = mock(PasswordService.class);
		TokenService tokens = mock(TokenService.class);
		expect(repository.findByUsername("user")).andReturn(credentials());
		expect(passwords.matches("password", "hash", "salt")).andThrow(new NoSuchAlgorithmException());
		replay(repository, passwords, tokens);

		assertNull(new AuthenticationService(repository, passwords, tokens).login("user", "password"));

		verify(repository, passwords, tokens);
	}

	private VolunteerCredentials credentials() {
		return new VolunteerCredentials(7, "user", "hash", "salt", List.of(new ChapterRole(2, "Editor")), "Editor");
	}
}