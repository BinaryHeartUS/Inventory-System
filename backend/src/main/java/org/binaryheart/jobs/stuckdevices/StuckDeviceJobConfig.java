package org.binaryheart.jobs.stuckdevices;

import java.util.Map;

public record StuckDeviceJobConfig(int thresholdDays, long scanIntervalHours) {
	public static final int DEFAULT_THRESHOLD_DAYS = 14;
	public static final long DEFAULT_SCAN_INTERVAL_HOURS = 24;

	public StuckDeviceJobConfig {
		if (thresholdDays < 1) {
			throw new IllegalArgumentException("STUCK_DEVICE_THRESHOLD_DAYS must be at least 1");
		}
		if (scanIntervalHours < 1) {
			throw new IllegalArgumentException("STUCK_DEVICE_SCAN_INTERVAL_HOURS must be at least 1");
		}
	}

	public static StuckDeviceJobConfig fromEnvironment() {
		return fromEnvironment(System.getenv());
	}

	public static StuckDeviceJobConfig fromEnvironment(Map<String, String> environment) {
		return new StuckDeviceJobConfig(parseInt(environment, "STUCK_DEVICE_THRESHOLD_DAYS", DEFAULT_THRESHOLD_DAYS),
			parseLong(environment, "STUCK_DEVICE_SCAN_INTERVAL_HOURS", DEFAULT_SCAN_INTERVAL_HOURS));
	}

	private static int parseInt(Map<String, String> environment, String name, int defaultValue) {
		String value = environment.get(name);
		try {
			return value == null || value.isBlank() ? defaultValue : Integer.parseInt(value);
		} catch (NumberFormatException e) {
			throw new IllegalArgumentException(name + " must be an integer", e);
		}
	}

	private static long parseLong(Map<String, String> environment, String name, long defaultValue) {
		String value = environment.get(name);
		try {
			return value == null || value.isBlank() ? defaultValue : Long.parseLong(value);
		} catch (NumberFormatException e) {
			throw new IllegalArgumentException(name + " must be an integer", e);
		}
	}
}