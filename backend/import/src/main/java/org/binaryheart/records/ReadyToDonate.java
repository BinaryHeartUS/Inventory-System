package org.binaryheart.records;

import org.binaryheart.enums.OperatingSystem;
import org.binaryheart.enums.RamGeneration;
import org.binaryheart.enums.StorageType;
import org.binaryheart.enums.TypeOfDevice;

public record ReadyToDonate(
                String deviceName,
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
                int ID) {

}
