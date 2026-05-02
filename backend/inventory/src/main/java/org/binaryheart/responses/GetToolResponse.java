package org.binaryheart.responses;

import java.time.LocalDate;

public record GetToolResponse(int id, LocalDate acquisitionDate, double value, String description, int chapterId,
        int donorId) {

}
