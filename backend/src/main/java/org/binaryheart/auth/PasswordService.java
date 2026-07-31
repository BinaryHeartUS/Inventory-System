package org.binaryheart.auth;

import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;

public class PasswordService {

	public PasswordHash hash(String password) throws NoSuchAlgorithmException, InvalidKeySpecException {
		byte[] salt = EncryptionHelper.getNewSalt();
		return new PasswordHash(EncryptionHelper.hashPassword(salt, password),
			EncryptionHelper.getStringFromBytes(salt));
	}

	public boolean matches(String password, String expectedHash, String encodedSalt)
		throws NoSuchAlgorithmException, InvalidKeySpecException {
		return EncryptionHelper.hashPassword(EncryptionHelper.DECODER.decode(encodedSalt), password)
			.equals(expectedHash);
	}

	public record PasswordHash(String hash, String salt) {
	}
}