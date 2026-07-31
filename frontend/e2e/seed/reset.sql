\set ON_ERROR_STOP on

BEGIN;
TRUNCATE TABLE
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