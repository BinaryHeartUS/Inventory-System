create table Laptop (
ID integer primary key,
foreign key (ID) references Device(ID),
Design_battery_capacity Integer NOT NULL,
check (Design_battery_capacity > 0),
Actual_battery_capacity Integer NOT NULL,
check (Actual_battery_capacity > 0),
check (Actual_battery_capacity <= Design_battery_capacity),
Battery_health NUMERIC GENERATED ALWAYS AS (Actual_battery_capacity::NUMERIC / Design_battery_capacity) STORED,
Includes_charger boolean NOT NULL
);