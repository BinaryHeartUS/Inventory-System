package org.binaryheart.requests;

import java.time.LocalDate;

public record InsertToolRequest(int chapterId, Integer id, String description, LocalDate acquisitionDate, Double value,
                Integer donorId) {

}
