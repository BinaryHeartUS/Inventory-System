create table Laptop (
    ID INTEGER PRIMARY KEY,
    FOREIGN KEY (ID) REFERENCES Device(ID),
    Design_battery_capacity INTEGER NOT NULL,
    CHECK (Design_battery_capacity > 0),
    Actual_battery_capacity INTEGER NOT NULL,
    CHECK (Actual_battery_capacity > 0),
    CHECK (Actual_battery_capacity <= Design_battery_capacity),
    Battery_health NUMERIC GENERATED ALWAYS AS (Actual_battery_capacity::NUMERIC / Design_battery_capacity) STORED,
    Includes_charger BOOLEAN NOT NULL
);