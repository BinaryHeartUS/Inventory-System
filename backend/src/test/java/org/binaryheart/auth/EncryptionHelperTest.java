package org.binaryheart.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import org.junit.jupiter.api.Test;

class EncryptionHelperTest {

	private final EncryptionHelper helper = new EncryptionHelper();

	@Test
	void getStringFromBytesUsesBase64() {
		assertEquals("aGVsbG8=", helper.getStringFromBytes("hello".getBytes(StandardCharsets.UTF_8)));
	}

	@Test
	void getNewSaltReturnsIndependentSixteenByteValues() {
		byte[] first = helper.getNewSalt();
		byte[] second = helper.getNewSalt();

		assertEquals(16, first.length);
		assertEquals(16, second.length);
		assertFalse(Arrays.equals(first, second));
	}

	@Test
	void hashPasswordIsDeterministicForSaltAndSensitiveToPassword() throws Exception {
		byte[] salt = new byte[16];
		String first = helper.hashPassword(salt, "password");

		assertEquals(first, helper.hashPassword(salt, "password"));
		assertNotEquals(first, helper.hashPassword(salt, "different"));
	}
}