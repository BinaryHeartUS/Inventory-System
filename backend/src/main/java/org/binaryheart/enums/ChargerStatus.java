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
		if (value == null) {
			return null;
		}
		for (ChargerStatus s : values()) {
			if (s.databaseValue.equals(value)) {
				return s;
			}
		}
		throw new IllegalArgumentException("Unknown ChargerStatus value: " + value);
	}
}
