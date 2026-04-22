package org.binaryheart.enums;

public enum Manufacturer {
    DELL("Dell"),
    HP("HP"),
    LENOVO("Lenovo"),
    APPLE("Apple"),
    ASUS("Asus"),
    ACER("Acer"),
    MICROSOFT("Microsoft"),
    TOSHIBA("Toshiba"),
    SAMSUNG("Samsung"),
    COOLERMASTER("Cooler Master"),
    ZOTAC("Zotac");

    private final String databaseValue;

    Manufacturer(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }
}
