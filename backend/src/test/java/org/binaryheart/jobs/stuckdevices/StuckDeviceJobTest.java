package org.binaryheart.jobs.stuckdevices;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import java.sql.SQLException;
import org.junit.jupiter.api.Test;

class StuckDeviceJobTest {
	@Test
	void runRefreshesUsingConfiguredThreshold() throws Exception {
		StuckDeviceJobRepository repository = mock(StuckDeviceJobRepository.class);
		expect(repository.refresh(14)).andReturn(2);
		replay(repository);

		new StuckDeviceJob(repository, new StuckDeviceJobConfig(14, 24)).run();

		verify(repository);
	}

	@Test
	void runContainsDatabaseFailures() throws Exception {
		StuckDeviceJobRepository repository = mock(StuckDeviceJobRepository.class);
		expect(repository.refresh(14)).andThrow(new SQLException("offline"));
		replay(repository);

		StuckDeviceJob job = new StuckDeviceJob(repository, new StuckDeviceJobConfig(14, 24));

		assertDoesNotThrow(job::run);
		verify(repository);
	}

	@Test
	void runContainsUnexpectedFailures() throws Exception {
		StuckDeviceJobRepository repository = mock(StuckDeviceJobRepository.class);
		expect(repository.refresh(14)).andThrow(new IllegalStateException("unexpected"));
		replay(repository);

		StuckDeviceJob job = new StuckDeviceJob(repository, new StuckDeviceJobConfig(14, 24));

		assertDoesNotThrow(job::run);
		verify(repository);
	}
}