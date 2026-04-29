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

    public static ChargerStatus fromDatabaseValue(String value) {
        if ("Included".equals(value)) {
            return INCLUDED;
        } else if ("Not Included".equals(value)) {
            return NOT_INCLUDED;
        } else {
            return UNKNOWN;
        }
    }
}
