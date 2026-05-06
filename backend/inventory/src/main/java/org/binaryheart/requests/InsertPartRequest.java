package org.binaryheart.requests;

import java.sql.Date;

public record InsertPartRequest(int chapterId, String type, String description, Boolean wasPurchased,
        Integer containedIn, Integer id, Date acquisitionDate, Double value, Integer donorId) {
}