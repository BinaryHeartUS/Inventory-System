package org.binaryheart.services;

import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;
import org.binaryheart.auth.EncryptionHelper;
import org.binaryheart.auth.JwtService;
import org.binaryheart.models.VolunteerCredentials;
import org.binaryheart.repositories.AuthRepository;
import org.binaryheart.responses.LoginResponse;

public class AuthService {

  private final AuthRepository repository = new AuthRepository();

  public LoginResponse login(String username, String password) throws SQLException {
    VolunteerCredentials credentials = repository.findByUsername(username);

    if (credentials == null) {
      return null;
    }
    boolean result;
    try {
      System.out.println(credentials.passwordHash().concat(credentials.passwordSalt()));
      result =
          EncryptionHelper.hashPassword(
                  EncryptionHelper.DECODER.decode(credentials.passwordSalt()), password)
              .equals(credentials.passwordHash());
    } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
      return null;
    }

    if (!result) {
      return null;
    }
    String token =
        JwtService.create(
            credentials.id(),
            credentials.username(),
            credentials.chapterRoles(),
            credentials.effectiveRole());
    return new LoginResponse(
        token, credentials.username(), credentials.chapterRoles(), credentials.effectiveRole());
  }
}
