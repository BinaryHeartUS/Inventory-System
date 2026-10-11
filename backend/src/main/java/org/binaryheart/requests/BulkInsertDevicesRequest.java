package org.binaryheart.requests;

import java.time.LocalDate;

public record BulkInsertDevicesRequest(int count, String type, int chapterId, String manufacturer, String model,
	int year, Integer donorId, LocalDate acquisitionDate) {
}