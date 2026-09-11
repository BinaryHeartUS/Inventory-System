package org.binaryheart.services;

import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.sql.SQLException;
import org.binaryheart.repositories.HealthRepository;
import org.junit.jupiter.api.Test;

class HealthServiceTest {

	@Test
	void liveReturnsOkWithoutCheckingDependencies() {
		HealthRepository repository = mock(HealthRepository.class);
		replay(repository);

		assertEquals("OK", new HealthService(repository).live());

		verify(repository);
	}

	@Test
	void readyReturnsOkWhenDatabaseIsAvailable() throws Exception {
		HealthRepository repository = mock(HealthRepository.class);
		repository.checkDatabaseConnection();
		replay(repository);

		assertEquals("OK", new HealthService(repository).ready());

		verify(repository);
	}

	@Test
	void readyFailsWhenDatabaseIsUnavailable() throws Exception {
		HealthRepository repository = mock(HealthRepository.class);
		repository.checkDatabaseConnection();
		expectLastCall().andThrow(new SQLException("unavailable"));
		replay(repository);

		assertThrows(SQLException.class, () -> new HealthService(repository).ready());

		verify(repository);
	}
}