package org.binaryheart.services;

import com.google.inject.Inject;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;
import org.binaryheart.auth.PasswordService;
import org.binaryheart.auth.TokenService;
import org.binaryheart.models.VolunteerCredentials;
import org.binaryheart.repositories.AuthRepository;
import org.binaryheart.responses.LoginResponse;

public class AuthenticationService {

	private final AuthRepository repository;
	private final PasswordService passwordService;
	private final TokenService tokenService;

	@Inject
	public AuthenticationService(AuthRepository repository, PasswordService passwordService,
		TokenService tokenService) {
		this.repository = repository;
		this.passwordService = passwordService;
		this.tokenService = tokenService;
	}

	public LoginResponse login(String username, String password) throws SQLException {
		VolunteerCredentials credentials = repository.findByUsername(username);

		if (credentials == null) {
			return null;
		}
		boolean result;
		try {
			result = passwordService.matches(password, credentials.passwordHash(), credentials.passwordSalt());
		} catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
			return null;
		}

		if (!result) {
			return null;
		}
		String token = tokenService.create(credentials.id(), credentials.username(), credentials.chapterRoles(),
			credentials.effectiveRole());
		return new LoginResponse(token, credentials.username(), credentials.chapterRoles(),
			credentials.effectiveRole());
	}
}