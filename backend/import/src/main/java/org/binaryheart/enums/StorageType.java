package org.binaryheart.enums;

public enum StorageType {
    SSD("SSD"), HDD("HDD"), FLASH_STORAGE("Flash Storage"), UNKNOWN("Unknown");

    private final String databaseValue;

    StorageType(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }

}
