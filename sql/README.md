# SQL Naming Convention

## Format

SQL scripts should have file name of the format `x.x.x script_name.sql`, detailed in the following sections:

- [First Digit](#first-digit)
- [Second Digit](#second-digit)
- [Third Digit](#third-digit)
- [Script Name Requirements](#script-name-requirements)
- [Purpose](#purpose)
- [Adding new folders](#adding-new-folders)

### First Digit

The first digit signifies the major category of script, for example:

- 0.0.0 is user creation
- 1.0.0 is type creation
- 2.0.0 is table creation
- 3.0.0 is stored procedure creation
- 4.0.0 is other scripts (currently unused)

### Second Digit

The second digit signifies the tier of dependency, for example:

- 2.0.x has no dependencies on any other table, but may have dependencies on 1.x.x types
- 2.1.x has a dependency on some 2.0.x table
- 2.2.x as a dependency on some 2.0.x or 2.1.x table, etc

### Third Digit

The third and final digit simply separates different scripts in the same tier. For example:

- 2.1.0 and 2.1.1 have no dependency on each other and are interchangable
- 2.3.1, 2.3.2, and 2.3.3 all similarly have no dependency on each other and can be added in any order

### Script Name Requirements

Scripts must be named using the following convention: `number action_target_type.sql`. For example:

- `3.0.0 Insert_Chapter_Procedure.sql` is valid because it follows the format number (3.0.0), action (Insert), target (Chapter), type (Procedure).
- `1.1.1 Create_PartType_Enum.sql` is valid because it follows the format number (1.1.1), action (Create), target (PartType), type (Enum)
- `2.3.1 Create_Part_Table.sql` is valid because it follows the format number (2.3.1), action (Create), target (Part), type (Table)
- `4.0.0 Setup_Users_Script.sql` is valid because it follows the format number (4.0.0), action (Setup), target (Users), type (Script)

Ensure Snake case is used rather than camel case because postgres is case-insensitive (i.e. `Create_Manufacturer_Enum` is preferred over `CreateManufacturerEnum` because in postgres it would appear as `createmanufacturerenum`)

### Purpose

The purpose of this naming scheme is that all SQL scripts contained in /sql/DatabaseCreationScripts will be run in alphabetical order upon initialization of the Postgres server. Therefore, this naming scheme enforces an order for the scripts to run.

### Adding New Folders

In order to add new folders to be automatically executed beyond those already implemented (CreateStoredProcedures, CreateTables, CreateTypes, and EnumScripts) you must add the directory into sql/Dockerfile in the format `COPY path/to/folder/*.sql /docker-entrypoint-initdb.d/`
