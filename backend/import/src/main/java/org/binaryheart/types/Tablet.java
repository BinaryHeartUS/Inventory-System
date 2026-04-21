package org.binaryheart.types;

import java.util.Date;

import org.binaryheart.enums.Manufacturer;
import org.binaryheart.enums.Status;

public record Tablet(
        String name,
        int ID,
        Manufacturer manufacturer,
        int yearReleased,
        String notes,
        boolean chargerIncluded,
        boolean workingBattery,
        Status currentStatus,
        Date dateUpdated) {

}
