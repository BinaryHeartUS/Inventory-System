package org.binaryheart.responses;

public record PartResponse(
        int id,
        String type,
        String description,
        boolean wasPurchased,
        Integer containedIn,
        int chapterId,
        String ascquisitionDate,
        Double value
    ){}