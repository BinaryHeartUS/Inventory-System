package org.binaryheart.responses;

import java.time.LocalDate;

public record GetToolResponse(int id, LocalDate acquisitionDate, Double value, String description, int chapterId,
	Integer donorId) {
}
