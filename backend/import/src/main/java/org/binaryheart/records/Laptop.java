package org.binaryheart.records;

import java.util.Date;

import org.binaryheart.enums.Manufacturer;
import org.binaryheart.enums.Status;

public record Laptop(
                String name,
                int ID,
                Manufacturer manufacturer,
                int yearReleased,
                String notes,
                boolean hasCharger,
                boolean hasWorkingBattery,
                Status currentStatus,
                Date dateUpdated) {
}
