package org.binaryheart.enums;

public enum WorkingBattery {
    YES("Yes"), NO("No"), UNKNOWN("Unknown");

    private final String databaseValue;

    WorkingBattery(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }

}
