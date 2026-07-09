package org.binaryheart.responses;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ToolChangelogResponse(
    Integer toolID,
    String modifiedBy,
    OffsetDateTime modifiedAt,
    String changeType,
    LocalDate oldAcquisitionDate,
    LocalDate newAcquisitionDate,
    Double oldValue,
    Double newValue,
    Integer oldChapterID,
    Integer newChapterID,
    Integer oldDonorID,
    Integer newDonorID,
    String oldDescription,
    String newDescription) {}
