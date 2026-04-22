FROM postgres:16
COPY DatabaseCreationScripts/*.sql /docker-entrypoint-initdb.d/
COPY DatabaseCreationScripts/CreateTypes/*.sql /docker-entrypoint-initdb.d/
COPY DatabaseCreationScripts/CreateTypes/EnumScripts/*.sql /docker-entrypoint-initdb.d/
COPY DatabaseCreationScripts/CreateTables/*.sql /docker-entrypoint-initdb.d/
COPY DatabaseCreationScripts/CreateStoredProcedures/*.sql /docker-entrypoint-initdb.d/
COPY DatabaseCreationScripts/CreateStoredProcedures/CountProcedures/*.sql /docker-entrypoint-initdb.d/