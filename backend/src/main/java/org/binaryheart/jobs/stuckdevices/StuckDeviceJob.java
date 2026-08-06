package org.binaryheart.jobs.stuckdevices;

import com.google.inject.Inject;

public class StuckDeviceJob implements Runnable {
	private static final System.Logger LOGGER = System.getLogger(StuckDeviceJob.class.getName());

	private final StuckDeviceJobRepository repository;
	private final StuckDeviceJobConfig config;

	@Inject
	public StuckDeviceJob(StuckDeviceJobRepository repository, StuckDeviceJobConfig config) {
		this.repository = repository;
		this.config = config;
	}

	@Override
	public void run() {
		try {
			int updated = repository.refresh(config.thresholdDays());
			LOGGER.log(System.Logger.Level.INFO, "Stuck-device refresh completed; {0} device flags changed", updated);
		} catch (Exception e) {
			LOGGER.log(System.Logger.Level.ERROR, "Stuck-device refresh failed", e);
		}
	}
}