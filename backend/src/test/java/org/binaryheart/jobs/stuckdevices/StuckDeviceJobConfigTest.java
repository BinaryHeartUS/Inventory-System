package org.binaryheart.jobs.stuckdevices;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Map;
import org.junit.jupiter.api.Test;

class StuckDeviceJobConfigTest {
	@Test
	void environmentDefaultsAreUsedWhenValuesAreMissing() {
		StuckDeviceJobConfig config = StuckDeviceJobConfig.fromEnvironment(Map.of());

		assertEquals(14, config.thresholdDays());
		assertEquals(24, config.scanIntervalHours());
	}

	@Test
	void environmentOverridesAreParsed() {
		StuckDeviceJobConfig config = StuckDeviceJobConfig
			.fromEnvironment(Map.of("STUCK_DEVICE_THRESHOLD_DAYS", "21", "STUCK_DEVICE_SCAN_INTERVAL_HOURS", "6"));

		assertEquals(21, config.thresholdDays());
		assertEquals(6, config.scanIntervalHours());
	}

	@Test
	void nonNumericEnvironmentValueIsRejected() {
		assertThrows(IllegalArgumentException.class,
			() -> StuckDeviceJobConfig.fromEnvironment(Map.of("STUCK_DEVICE_THRESHOLD_DAYS", "two")));
	}

	@Test
	void nonPositiveThresholdIsRejected() {
		assertThrows(IllegalArgumentException.class, () -> new StuckDeviceJobConfig(0, 24));
	}

	@Test
	void nonPositiveIntervalIsRejected() {
		assertThrows(IllegalArgumentException.class, () -> new StuckDeviceJobConfig(14, 0));
	}
}