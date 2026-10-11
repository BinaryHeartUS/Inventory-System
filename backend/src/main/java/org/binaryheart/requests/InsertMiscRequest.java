package org.binaryheart.requests;

import java.time.LocalDate;

public record InsertMiscRequest(Integer assetId, String description, LocalDate acquisitionDate, Double value,
	Integer donorId) {
}