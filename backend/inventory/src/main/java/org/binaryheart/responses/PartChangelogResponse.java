package org.binaryheart.responses;

import java.time.LocalDate;

public record PartChangelogResponse(Integer partID, String modifiedBy, LocalDate modifiedAt, String changeType,
        LocalDate oldAcquisitionDate, LocalDate newAcquisitionDate, Double oldValue, double newValue,
        Integer oldChapterID, Integer newChapterID, Integer oldDonorID, Integer newDonorID, String oldType,
        String newType, String oldDescription, String newDescription, Boolean oldWasPurchased, Boolean newWasPurchased,
        Integer oldContainedIn, Integer newContainedIn) {

}
