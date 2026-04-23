package org.binaryheart.responses;

import java.time.LocalDate;

import org.binaryheart.enums.Manufacturer;
import org.binaryheart.enums.RamGeneration;
import org.binaryheart.enums.Status;
import org.binaryheart.enums.StorageType;

public record GetDesktopResponse(int id, LocalDate acquisitionDate, double value, Manufacturer manufacturer,
        String model, int year, String cpu, int ram, RamGeneration ramGeneration, int storageAmount,
        StorageType storageType, Status status, boolean hasWifi) {

}
// The following columns are part of either asset, device, or desktop and are
// not returned by this response:
// Chapter ID
// Donor ID
// Recipient ID
