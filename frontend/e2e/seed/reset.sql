\set ON_ERROR_STOP on

BEGIN;
TRUNCATE TABLE
    Asset_Change_Log,
    Device_Change_Log,
    Part_Change_Log,
    Desktop_Change_Log,
    Tool_Change_Log,
    Laptop_Change_Log,
    Tablet_Change_Log,
    Asset,
    Volunteer,
    Party,
    Chapter,
    Role,
    Manufacturer,
    Ram_Generation,
    Storage_Type,
    Part_Type,
    Operating_System
RESTART IDENTITY CASCADE;
\ir R__900_Seed_E2E.sql
COMMIT;