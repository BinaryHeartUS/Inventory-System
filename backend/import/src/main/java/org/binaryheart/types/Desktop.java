package org.binaryheart.types;

import java.util.Date;

import org.binaryheart.enums.Manufacturer;
import org.binaryheart.enums.Status;

public record Desktop(
        String name,
        int ID,
        Manufacturer manufacturer,
        int yearReleased,
        String notes,
        Status currentStatus,
        Date dateUpdated) {

}
