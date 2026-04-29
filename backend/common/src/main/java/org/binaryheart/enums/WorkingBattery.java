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

    public static WorkingBattery fromDatabaseValue(String value) {
        if ("Yes".equals(value)) {
            return YES;
        } else if ("No".equals(value)) {
            return NO;
        } else {
            return UNKNOWN;
        }
    }
}
