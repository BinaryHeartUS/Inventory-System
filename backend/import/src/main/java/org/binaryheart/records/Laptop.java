package org.binaryheart.records;

import java.util.Date;

import org.binaryheart.enums.ChargerStatus;
import org.binaryheart.enums.Manufacturer;
import org.binaryheart.enums.Status;
import org.binaryheart.enums.WorkingBattery;

public record Laptop(
                String name,
                Integer ID,
                Manufacturer manufacturer,
                Integer yearReleased,
                String notes,
                ChargerStatus hasCharger,
                WorkingBattery hasWorkingBattery,
                Status currentStatus,
                Date dateUpdated) {
}
