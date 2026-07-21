package org.binaryheart.requests;

import java.time.LocalDate;

public record InsertLaptopRequest(int chapterId, String manufacturer, String model, int year, String status,
	String includesCharger, Integer assetId, String cpu, Integer ram, String ramGeneration, Integer storageAmount,
	String storageType, Double value, LocalDate acquisitionDate, Integer recipientId, Integer donorId,
	Integer designBatteryCapacity, Integer actualBatteryCapacity, String operatingSystem) {
}
