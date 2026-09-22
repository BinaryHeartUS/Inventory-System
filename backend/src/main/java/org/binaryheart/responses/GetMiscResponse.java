package org.binaryheart.responses;

import java.time.LocalDate;

public record GetMiscResponse(int id, LocalDate acquisitionDate, Double value, String description, int donorId) {
}