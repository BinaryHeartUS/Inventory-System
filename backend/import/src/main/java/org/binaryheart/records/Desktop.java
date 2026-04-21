package org.binaryheart.records;

import java.util.Date;

import org.binaryheart.enums.Manufacturer;
import org.binaryheart.enums.Status;

public record Desktop(
        String name,
        Integer ID,
        Manufacturer manufacturer,
        Integer yearReleased,
        String notes,
        Status currentStatus,
        Date dateUpdated) {

}
