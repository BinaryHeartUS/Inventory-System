package org.binaryheart.enums;

public enum OperatingSystem {
    WINDOWS_11("Windows 11"), VANILLA_OS("Vanilla OS"), MACOS("macOS"), IPAD_OS("iPadOS"), IOS("iOS"),
    UNKNOWN("Unknown");

    private final String databaseValue;

    OperatingSystem(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }
}
