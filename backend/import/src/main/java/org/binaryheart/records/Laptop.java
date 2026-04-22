package org.binaryheart.records;

import java.time.LocalDate;

import org.binaryheart.enums.ChargerStatus;
import org.binaryheart.enums.Manufacturer;
import org.binaryheart.enums.Status;
import org.binaryheart.enums.WorkingBattery;

public record Laptop(String name, Integer ID, Manufacturer manufacturer, Integer yearReleased, String notes,
        ChargerStatus hasCharger, WorkingBattery hasWorkingBattery, Status currentStatus, LocalDate dateUpdated) {
    public Laptop {
        if (name == null || name.strip().equals("")) {
            throw new IllegalArgumentException("Name cannot be null");
        }
        if (manufacturer == null) {
            manufacturer = Manufacturer.UNKNOWN;
        }
        if (hasCharger == null) {
            hasCharger = ChargerStatus.UNKNOWN;
        }
        if (hasWorkingBattery == null) {
            hasWorkingBattery = WorkingBattery.UNKNOWN;
        }
        if (currentStatus == null) {
            currentStatus = Status.UNKNOWN;
        }
    }
}
