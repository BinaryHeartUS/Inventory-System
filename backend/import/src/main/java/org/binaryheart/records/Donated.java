package org.binaryheart.records;

import java.util.Date;

import org.binaryheart.enums.OperatingSystem;
import org.binaryheart.enums.RamGeneration;
import org.binaryheart.enums.StorageType;
import org.binaryheart.enums.TypeOfDevice;

public record Donated(
        String name,
        TypeOfDevice typeOfDevice,
        Integer estimatedYear,
        String cpu,
        OperatingSystem os,
        Integer ramAmount,
        RamGeneration ramGeneration,
        Integer storageCapacity,
        StorageType storageType,
        Integer estimatedValue,
        String notes,
        Date dateDonated,
        String recipient) {

}
