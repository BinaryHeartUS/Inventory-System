package org.binaryheart.requests;

import java.time.LocalDate;

public record InsertToolRequest(int chapterId, Integer assetId, String description, LocalDate acquisitionDate,
	Double value, Integer donorId) {
}
