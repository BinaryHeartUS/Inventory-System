package org.binaryheart.jobs.stuckdevices;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class StuckDeviceJobTest {
	private final Logger logger = Logger.getLogger(StuckDeviceJob.class.getName());
	private final RecordingHandler logHandler = new RecordingHandler();
	private boolean useParentHandlers;

	@BeforeEach
	void captureLogs() {
		useParentHandlers = logger.getUseParentHandlers();
		logger.setUseParentHandlers(false);
		logger.addHandler(logHandler);
	}

	@AfterEach
	void restoreLogs() {
		logger.removeHandler(logHandler);
		logger.setUseParentHandlers(useParentHandlers);
	}

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
		SQLException failure = new SQLException("offline");
		expect(repository.refresh(14)).andThrow(failure);
		replay(repository);

		StuckDeviceJob job = new StuckDeviceJob(repository, new StuckDeviceJobConfig(14, 24));

		assertDoesNotThrow(job::run);
		assertFailureLogged(failure);
		verify(repository);
	}

	@Test
	void runContainsUnexpectedFailures() throws Exception {
		StuckDeviceJobRepository repository = mock(StuckDeviceJobRepository.class);
		IllegalStateException failure = new IllegalStateException("unexpected");
		expect(repository.refresh(14)).andThrow(failure);
		replay(repository);

		StuckDeviceJob job = new StuckDeviceJob(repository, new StuckDeviceJobConfig(14, 24));

		assertDoesNotThrow(job::run);
		assertFailureLogged(failure);
		verify(repository);
	}

	private void assertFailureLogged(Exception failure) {
		assertEquals(1, logHandler.records.size());
		LogRecord record = logHandler.records.getFirst();
		assertEquals(Level.SEVERE, record.getLevel());
		assertEquals("Stuck-device refresh failed", record.getMessage());
		assertSame(failure, record.getThrown());
	}

	private static final class RecordingHandler extends Handler {
		private final List<LogRecord> records = new ArrayList<>();

		@Override
		public void publish(LogRecord record) {
			records.add(record);
		}

		@Override
		public void flush() {
		}

		@Override
		public void close() {
		}
	}
}