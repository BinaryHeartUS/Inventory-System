package org.binaryheart.auth;

import com.google.inject.Inject;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;

public class PasswordService {
	private final EncryptionHelper encryptionHelper;

	@Inject
	public PasswordService(EncryptionHelper encryptionHelper) {
		this.encryptionHelper = encryptionHelper;
	}

	public PasswordHash hash(String password) throws NoSuchAlgorithmException, InvalidKeySpecException {
		byte[] salt = encryptionHelper.getNewSalt();
		return new PasswordHash(encryptionHelper.hashPassword(salt, password),
			encryptionHelper.getStringFromBytes(salt));
	}

	public boolean matches(String password, String expectedHash, String encodedSalt)
		throws NoSuchAlgorithmException, InvalidKeySpecException {
		return encryptionHelper.hashPassword(EncryptionHelper.DECODER.decode(encodedSalt), password)
			.equals(expectedHash);
	}

	public record PasswordHash(String hash, String salt) {
	}
}