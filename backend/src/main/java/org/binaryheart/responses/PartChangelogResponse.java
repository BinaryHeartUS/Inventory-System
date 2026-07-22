package org.binaryheart.responses;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record PartChangelogResponse(Integer partID, String modifiedBy, OffsetDateTime modifiedAt, String changeType,
	LocalDate oldAcquisitionDate, LocalDate newAcquisitionDate, Double oldValue, Double newValue, Integer oldChapterID,
	Integer newChapterID, Integer oldDonorID, Integer newDonorID, String oldType, String newType, String oldDescription,
	String newDescription, Boolean oldWasPurchased, Boolean newWasPurchased, Integer oldContainedIn,
	Integer newContainedIn) {
}
