create table Laptop (
    ID INTEGER PRIMARY KEY,
    FOREIGN KEY (ID) REFERENCES Device(ID),
    Design_battery_capacity INTEGER NULL,
    CHECK (Design_battery_capacity > 0),
    Actual_battery_capacity INTEGER NULL,
    CHECK (Actual_battery_capacity > 0),
    CHECK (Actual_battery_capacity <= Design_battery_capacity),
    Battery_health NUMERIC GENERATED ALWAYS AS (
        CASE
            WHEN Design_battery_capacity IS NOT NULL AND Actual_battery_capacity IS NOT NULL THEN (Actual_battery_capacity::NUMERIC / Design_battery_capacity)
            ELSE NULL
        END
    ) STORED,
    Includes_charger Charger_Status NOT NULL
);