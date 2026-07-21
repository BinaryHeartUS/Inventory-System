package org.binaryheart.responses;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record DeviceChangelogResponse(String deviceType, Integer deviceID, String modifiedBy, OffsetDateTime modifiedAt,
	String changeType, LocalDate oldAcquisitionDate, LocalDate newAcquisitionDate, Double oldValue, Double newValue,
	Integer oldChapterID, Integer newChapterID, Integer oldDonorID, Integer newDonorID, String oldManufacturer,
	String newManufacturer, String oldModel, String newModel, Integer oldYear, Integer newYear, String oldCPU,
	String newCPU, Integer oldRam, Integer newRam, String oldRamGeneration, String newRamGeneration,
	Integer oldStorageAmount, Integer newStorageAmount, String oldStorageType, String newStorageType, String oldStatus,
	String newStatus, Boolean oldHasWifi, Boolean newHasWifi, String oldIncludesCharger, String newIncludesCharger,
	Integer oldDesignCapacity, Integer newDesignCapacity, Integer oldActualCapacity, Integer newActualCapacity,
	Double oldBatteryHealth, Double newBatteryHealth, String oldWorkingBattery, String newWorkingBattery,
	LocalDate oldDonatedDate, LocalDate newDonatedDate, String oldOperatingSystem, String newOperatingSystem,
	Integer oldRecipientID, Integer newRecipientID) {
}
