package org.binaryheart.records;

import java.time.LocalDate;

import org.binaryheart.enums.OperatingSystem;
import org.binaryheart.enums.RamGeneration;
import org.binaryheart.enums.StorageType;
import org.binaryheart.enums.TypeOfDevice;

public record Donated(String deviceName, TypeOfDevice typeOfDevice, Integer estimatedYear, String cpu,
        OperatingSystem os, Integer ramAmount, RamGeneration ramGeneration, Integer storageCapacity,
        StorageType storageType, Integer estimatedValue, String notes, LocalDate dateDonated, String recipient) {
    public Donated {
        if (deviceName == null || deviceName.strip().equals("")) {
            throw new IllegalArgumentException("Device name cannot be null");
        }
        if (typeOfDevice == null) {
            throw new IllegalArgumentException("Type of device cannot be null");
        }
        if (estimatedValue == null || estimatedValue < 0) {
            throw new IllegalArgumentException("Estimated value cannot be null or negative");
        }
        if (dateDonated == null) {
            throw new IllegalArgumentException("Date donated cannot be null");
        }
        if (os == null) {
            os = OperatingSystem.UNKNOWN;
        }
        if (ramAmount == null) {
            ramAmount = 0;
        }
        if (ramGeneration == null) {
            ramGeneration = RamGeneration.UNKNOWN;
        }
        if (storageType == null) {
            storageType = StorageType.UNKNOWN;
        }
    }

}
