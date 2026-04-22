package org.binaryheart.enums;

public enum TypeOfDevice {
    LAPTOP("Laptop"), DESKTOP("Desktop"), TABLET("Tablet"), UNKNOWN("Unknown");

    private final String databaseValue;

    TypeOfDevice(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }

}
