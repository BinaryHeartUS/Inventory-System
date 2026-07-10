package org.binaryheart.enums;

public enum WorkingBattery {
	YES("Yes"), NO("No"), UNKNOWN("Unknown");

	private final String databaseValue;

	WorkingBattery(String databaseValue) {
		this.databaseValue = databaseValue;
	}

	public String getDatabaseValue() {
		return databaseValue;
	}

	public static WorkingBattery fromDatabaseValue(String value) {
		if (value == null) {
			return null;
		}
		for (WorkingBattery w : values()) {
			if (w.databaseValue.equals(value)) {
				return w;
			}
		}
		throw new IllegalArgumentException("Unknown WorkingBattery value: " + value);
	}
}
