package org.binaryheart.services;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class HealthServiceTest {

	@Test
	void healthReturnsOk() {
		assertEquals("OK", new HealthService().health());
	}

	@Test
	void pingReturnsPong() {
		assertEquals("pong", new HealthService().ping());
	}
}