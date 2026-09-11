package org.binaryheart.jobs.stuckdevices;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import java.util.List;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;

class StuckDeviceJobSchedulerTest {
	@Test
	void startSchedulesOneImmediateFixedDelayJob() {
		StuckDeviceJob job = mock(StuckDeviceJob.class);
		ScheduledExecutorService executor = mock(ScheduledExecutorService.class);
		expect(executor.scheduleWithFixedDelay(job, 0, 24, TimeUnit.HOURS)).andReturn(null);
		replay(job, executor);
		StuckDeviceJobScheduler scheduler = new StuckDeviceJobScheduler(job, new StuckDeviceJobConfig(14, 24),
			executor);

		scheduler.start();
		scheduler.start();

		verify(job, executor);
	}

	@Test
	void closeStopsScheduledWork() {
		StuckDeviceJob job = mock(StuckDeviceJob.class);
		ScheduledExecutorService executor = mock(ScheduledExecutorService.class);
		expect(executor.shutdownNow()).andReturn(List.of());
		replay(job, executor);
		StuckDeviceJobScheduler scheduler = new StuckDeviceJobScheduler(job, new StuckDeviceJobConfig(14, 24),
			executor);

		scheduler.close();

		verify(job, executor);
	}
}