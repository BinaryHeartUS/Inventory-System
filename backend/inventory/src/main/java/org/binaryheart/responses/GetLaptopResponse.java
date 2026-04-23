package org.binaryheart.responses;

import java.time.LocalDate;

import org.binaryheart.enums.ChargerStatus;
import org.binaryheart.enums.Status;

public record GetLaptopResponse(int id, LocalDate acquisitionDate, double value, String manufacturer, String model,
                int year, String cpu, int ram, String ramGeneration, int storageAmount, String storageType,
                Status status, ChargerStatus includesCharger, Integer designBatteryCapacity,
                Integer actualBatteryCapacity, Double batteryHealth) {

}
// The following columns are part of either asset, device, or laptop and are
// not returned by this response:
// Chapter ID
// Donor ID
// Recipient ID
