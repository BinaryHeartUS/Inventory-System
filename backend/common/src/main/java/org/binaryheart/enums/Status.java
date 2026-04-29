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
        if ("Not Started".equals(value)) {
            return NOT_STARTED;
        } else if ("In Progress".equals(value)) {
            return IN_PROGRESS;
        } else if ("Ready To Donate".equals(value)) {
            return READY_TO_DONATE;
        } else if ("Scrapped".equals(value)) {
            return SCRAPPED;
        } else {
            return UNKNOWN;
        }
    }
}
