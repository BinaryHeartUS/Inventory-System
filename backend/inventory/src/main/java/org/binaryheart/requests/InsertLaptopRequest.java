package org.binaryheart.requests;

import org.binaryheart.enums.ChargerStatus;
import org.binaryheart.enums.Manufacturer;
import org.binaryheart.enums.RamGeneration;
import org.binaryheart.enums.Status;
import org.binaryheart.enums.StorageType;

import java.time.LocalDate;

public record InsertLaptopRequest(int chapterId, Manufacturer manufacturer, String model, int year, Status status,
        ChargerStatus includesCharger, Integer assetId, String cpu, Integer ram, RamGeneration ramGeneration,
        Integer storageAmount, StorageType storageType, Double value, LocalDate acquisitionDate, Integer recipientId,
        Integer donorId, Integer designBatteryCapacity, Integer actualBatteryCapacity) {
}
