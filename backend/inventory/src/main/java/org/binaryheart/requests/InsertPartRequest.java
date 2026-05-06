package org.binaryheart.requests;

import java.time.LocalDate;

public record InsertPartRequest(int chapterId, String type, String description, Boolean wasPurchased,
                Integer containedIn, Integer id, LocalDate acquisitionDate, Double value, Integer donorId) {
}