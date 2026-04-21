package org.binaryheart.types;

import java.util.Date;

import org.binaryheart.enums.OperatingSystem;
import org.binaryheart.enums.RamGeneration;
import org.binaryheart.enums.StorageType;
import org.binaryheart.enums.TypeOfDevice;

public record Donated(
        String name,
        TypeOfDevice typeOfDevice,
        int estimatedYear,
        String cpu,
        OperatingSystem os,
        int ramAmount,
        RamGeneration ramGeneration,
        int storageCapacity,
        StorageType storageType,
        int estimatedValue,
        String notes,
        Date dateDonated,
        String recipient) {

}
