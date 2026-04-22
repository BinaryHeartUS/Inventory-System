package org.binaryheart.enums;

public enum Status {
    NOT_STARTED("Not Started"), IN_PROGRESS("In Progress"), UNKNOWN("Unknown");

    private final String databaseValue;

    Status(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }
}
