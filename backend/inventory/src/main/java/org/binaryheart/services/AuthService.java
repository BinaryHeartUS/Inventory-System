package org.binaryheart.services;

import java.sql.SQLException;

import org.binaryheart.auth.JwtService;
import org.binaryheart.models.VolunteerCredentials;
import org.binaryheart.repositories.AuthRepository;
import org.binaryheart.responses.LoginResponse;

import at.favre.lib.crypto.bcrypt.BCrypt;

public class AuthService {

    private final AuthRepository repository = new AuthRepository();

    public LoginResponse login(String username, String password) throws SQLException {
        VolunteerCredentials credentials = repository.findByUsername(username);

        if (credentials == null) {
            return null;
        }
        BCrypt.Result result = BCrypt.verifyer().verify(password.toCharArray(),
                credentials.passwordHash().toCharArray());
        if (!result.verified) {
            return null;
        }
        String token = JwtService.create(credentials.id(), credentials.username(), credentials.chapterIds());
        return new LoginResponse(token, credentials.username(), credentials.chapterIds());
    }
}
