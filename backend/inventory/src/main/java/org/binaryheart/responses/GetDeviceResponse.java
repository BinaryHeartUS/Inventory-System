package org.binaryheart.responses;

import java.time.LocalDate;

import org.binaryheart.enums.Status;
import org.binaryheart.enums.ChargerStatus;
import org.binaryheart.enums.WorkingBattery;

public record GetDeviceResponse(String type, int id, LocalDate acquisitionDate, double value, String manufacturer,
                String model, int year, String cpu, int ram, String ramGeneration, int storageAmount,
                String storageType, Status status, Boolean hasWifi, ChargerStatus includesCharger,
                Integer designBatteryCapacity, Integer actualBatteryCapacity, Double batteryHealth,
                WorkingBattery workingBattery) {

}