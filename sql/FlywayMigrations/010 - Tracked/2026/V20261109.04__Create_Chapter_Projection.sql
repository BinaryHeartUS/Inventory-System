ALTER TABLE Chapter ADD COLUMN Active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE Chapter DROP CONSTRAINT chapter_name_key;
ALTER TABLE Chapter ADD CONSTRAINT chapter_name_key UNIQUE (Name) DEFERRABLE;

CREATE TABLE Chapter_Sync_State (
    ID BOOLEAN PRIMARY KEY DEFAULT true CHECK (ID),
    Last_Success_At TIMESTAMPTZ NOT NULL
);
REVOKE ALL ON Chapter_Sync_State FROM api_user, importer;
GRANT SELECT ON Chapter_Sync_State TO api_user;

-- Only the reconciliation routine may change the directory at runtime.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON Chapter FROM api_user, importer;
