package org.binaryheart.requests;

import org.binaryheart.enums.Manufacturer;
import org.binaryheart.enums.RamGeneration;
import org.binaryheart.enums.Status;
import org.binaryheart.enums.StorageType;

import java.time.LocalDate;

public record InsertDesktopRequest(int chapterId, Manufacturer manufacturer, String model, int year, Status status,
                Integer assetId, String cpu, Integer ram, RamGeneration ramGeneration, Integer storageAmount,
                StorageType storageType, Double value, LocalDate acquisitionDate, Integer recipientId, Integer donorId,
                Boolean hasWifi) {
}
