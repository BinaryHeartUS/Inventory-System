package org.binaryheart.enums;

public enum PartType {
    SODIMM("SODIMM"), DIMM("DIMM"), M2SSD("M.2 SSD"), SATASSD("SATA SSD"), HDD("HDD"), CPU("CPU"), GPU("GPU"),
    OTHER("Other");

    private final String databaseValue;

    PartType(String databaseValue) {
        this.databaseValue = databaseValue;
    }

    public String getDatabaseValue() {
        return databaseValue;
    }
}
