package org.binaryheart.jobs.stuckdevices;

import com.google.inject.Inject;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class StuckDeviceJobScheduler implements AutoCloseable {
	private final StuckDeviceJob job;
	private final StuckDeviceJobConfig config;
	private final ScheduledExecutorService executor;
	private boolean started;

	@Inject
	public StuckDeviceJobScheduler(StuckDeviceJob job, StuckDeviceJobConfig config) {
		this(job, config, Executors.newSingleThreadScheduledExecutor(runnable -> {
			Thread thread = new Thread(runnable, "stuck-device-job");
			thread.setDaemon(true);
			return thread;
		}));
	}

	StuckDeviceJobScheduler(StuckDeviceJob job, StuckDeviceJobConfig config, ScheduledExecutorService executor) {
		this.job = job;
		this.config = config;
		this.executor = executor;
	}

	public synchronized void start() {
		if (started) {
			return;
		}
		started = true;
		executor.scheduleWithFixedDelay(job, 0, config.scanIntervalHours(), TimeUnit.HOURS);
	}

	@Override
	public synchronized void close() {
		executor.shutdownNow();
	}
}