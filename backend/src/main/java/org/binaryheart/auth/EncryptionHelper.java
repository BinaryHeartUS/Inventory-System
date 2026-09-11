package org.binaryheart.auth;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;
import java.util.Random;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public class EncryptionHelper {
	private static final Random RANDOM = new SecureRandom();
	public static final Base64.Encoder ENCODER = Base64.getEncoder();
	public static final Base64.Decoder DECODER = Base64.getDecoder();

	// Cryptographic helper functions from Connectivity lab
	public String hashPassword(byte[] salt, String password) throws NoSuchAlgorithmException, InvalidKeySpecException {
		KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 65536, 128);
		SecretKeyFactory f;
		byte[] hash = null;
		f = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
		hash = f.generateSecret(spec).getEncoded();
		return getStringFromBytes(hash);
	}

	public String getStringFromBytes(byte[] data) {
		return ENCODER.encodeToString(data);
	}

	public byte[] getNewSalt() {
		byte[] salt = new byte[16];
		RANDOM.nextBytes(salt);
		return salt;
	}
}
