package org.binaryheart.enums;

public enum Status {
    NOT_STARTED("Not Started"), IN_PROGRESS("In Progress"), READY_TO_DONATE("Ready To Donate"), DONATED("Donated"),
    SCRAPPED("Scrapped"), UNKNOWN("Unknown");

    private final String databaseValue;

    Status(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }

    public static Status fromDatabaseValue(String value) {
        for (Status s : values()) {
            if (s.databaseValue.equals(value))
                return s;
        }
        throw new IllegalArgumentException("Unknown Status value: " + value);
    }
}
