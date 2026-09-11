-- Flyway afterMigrate callback: sync the application role passwords from env.
--
-- Runs automatically after every successful `flyway migrate`. This replaces the
-- old migrate.sh tail that did `ALTER USER … PASSWORD …` from env vars.
--
-- The placeholders are filled by Flyway from the FLYWAY_PLACEHOLDERS_* env vars
-- set on the db-migrate service (Compose): FLYWAY_PLACEHOLDERS_API_USER_PASSWORD
-- and FLYWAY_PLACEHOLDERS_IMPORTER_PASSWORD.
--
-- Callbacks are not recorded in flyway_schema_history and their bodies are not
-- echoed at the default INFO log level, so the passwords do not leak into
-- history or normal logs. Do not run deploys at -X/debug.
ALTER USER api_user PASSWORD '${api_user_password}';
ALTER USER importer PASSWORD '${importer_password}';
