package org.binaryheart.responses;

import java.time.LocalDate;

public record GetDeviceResponse(String type, int id, LocalDate acquisitionDate, double value, String manufacturer,
        String model, int year, String cpu, int ram, String ramGeneration, int storage, String storageType,
        String status, Boolean hasWifi, String includesCharger, Integer designBatteryCapacity,
        Integer actualBatteryCapacity, Double batteryHealth, String workingBattery, String chapter,
        LocalDate donatedDate, String operatingSystem, Integer donorId, Integer recipientId) {

}