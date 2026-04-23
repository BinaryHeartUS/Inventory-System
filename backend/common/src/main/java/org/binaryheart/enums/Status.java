package org.binaryheart.enums;

public enum Status {
    NOT_STARTED("Not Started"), IN_PROGRESS("In Progress"), READY_TO_DONATE("Ready To Donate"), DONATED("Donated"),
    UNKNOWN("Unknown");

    private final String databaseValue;

    Status(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }
}
