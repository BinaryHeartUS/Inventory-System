package org.binaryheart.enums;

public enum RamGeneration {
    DDR2("DDR2"), DDR3("DDR3"), DDR4("DDR4"), DDR5("DDR5"), UNKNOWN("Unknown");

    private final String databaseValue;

    RamGeneration(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }
}
