package org.binaryheart.enums;

public enum ChargerStatus {
    INCLUDED("Included"), NOT_INCLUDED("Not Included"), UNKNOWN("Unknown");

    private final String databaseValue;

    ChargerStatus(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }
}
