package org.binaryheart.responses;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record MiscChangelogResponse(Integer miscId, String modifiedBy, OffsetDateTime modifiedAt, String changeType,
	LocalDate oldAcquisitionDate, LocalDate newAcquisitionDate, Double oldValue, Double newValue, Integer oldDonorId,
	Integer newDonorId, String oldDescription, String newDescription) {
}