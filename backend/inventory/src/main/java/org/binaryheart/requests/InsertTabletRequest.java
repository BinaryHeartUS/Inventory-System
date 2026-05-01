package org.binaryheart.requests;

import org.binaryheart.enums.ChargerStatus;
import org.binaryheart.enums.Status;
import org.binaryheart.enums.WorkingBattery;

import java.time.LocalDate;

public record InsertTabletRequest(int chapterId, String manufacturer, String model, int year, Status status,
                ChargerStatus includesCharger, Integer assetId, String cpu, Integer ram, String ramGeneration,
                Integer storageAmount, String storageType, Double value, LocalDate acquisitionDate, Integer recipientId,
                Integer donorId, WorkingBattery workingBattery) {
}
