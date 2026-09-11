package org.binaryheart.auth;

import static org.easymock.EasyMock.aryEq;
import static org.easymock.EasyMock.eq;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Base64;
import org.binaryheart.auth.PasswordService.PasswordHash;
import org.junit.jupiter.api.Test;

class PasswordServiceTest {

	@Test
	void hashUsesFreshSaltAndReturnsEncodedValues() throws Exception {
		EncryptionHelper helper = mock(EncryptionHelper.class);
		byte[] salt = {1, 2, 3};
		expect(helper.getNewSalt()).andReturn(salt);
		expect(helper.hashPassword(salt, "password")).andReturn("hash");
		expect(helper.getStringFromBytes(salt)).andReturn("salt");
		replay(helper);

		assertEquals(new PasswordHash("hash", "salt"), new PasswordService(helper).hash("password"));

		verify(helper);
	}

	@Test
	void matchesReturnsTrueForExpectedHash() throws Exception {
		EncryptionHelper helper = mock(EncryptionHelper.class);
		byte[] salt = {1, 2, 3};
		String encodedSalt = Base64.getEncoder().encodeToString(salt);
		expect(helper.hashPassword(aryEq(salt), eq("correct"))).andReturn("hash");
		replay(helper);

		assertTrue(new PasswordService(helper).matches("correct", "hash", encodedSalt));

		verify(helper);
	}

	@Test
	void matchesReturnsFalseForUnexpectedHash() throws Exception {
		EncryptionHelper helper = mock(EncryptionHelper.class);
		byte[] salt = {1, 2, 3};
		String encodedSalt = Base64.getEncoder().encodeToString(salt);
		expect(helper.hashPassword(aryEq(salt), eq("wrong"))).andReturn("other");
		replay(helper);

		assertFalse(new PasswordService(helper).matches("wrong", "hash", encodedSalt));

		verify(helper);
	}
}