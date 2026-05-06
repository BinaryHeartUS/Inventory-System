package org.binaryheart.requests;

import java.time.LocalDate;

public record InsertDesktopRequest(int chapterId, String manufacturer, String model, int year, String status,
        Integer assetId, String cpu, Integer ram, String ramGeneration, Integer storageAmount, String storageType,
        Double value, LocalDate acquisitionDate, Integer recipientId, Integer donorId, Boolean hasWifi,
        String operatingSystem) {
}
