package org.binaryheart.records;

import java.time.LocalDate;
import org.binaryheart.enums.ChargerStatus;
import org.binaryheart.enums.Status;
import org.binaryheart.enums.WorkingBattery;

public record Tablet(String name, Integer ID, String manufacturer, Integer yearReleased, String notes,
	ChargerStatus chargerIncluded, WorkingBattery workingBattery, Status currentStatus, LocalDate dateUpdated) {

	public Tablet {
		if (manufacturer == null) {
			manufacturer = "Unknown";
		}
		if (chargerIncluded == null) {
			chargerIncluded = ChargerStatus.UNKNOWN;
		}
		if (workingBattery == null) {
			workingBattery = WorkingBattery.UNKNOWN;
		}
		if (currentStatus == null) {
			currentStatus = Status.UNKNOWN;
		}
	}
}
