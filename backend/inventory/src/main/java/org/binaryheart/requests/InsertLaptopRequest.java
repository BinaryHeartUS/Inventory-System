package org.binaryheart.requests;

import org.binaryheart.enums.ChargerStatus;
import org.binaryheart.enums.Status;

import java.time.LocalDate;

public record InsertLaptopRequest(int chapterId, String manufacturer, String model, int year, Status status,
                ChargerStatus includesCharger, Integer assetId, String cpu, Integer ram, String ramGeneration,
                Integer storageAmount, String storageType, Double value, LocalDate acquisitionDate, Integer recipientId,
                Integer donorId, Integer designBatteryCapacity, Integer actualBatteryCapacity) {
}
