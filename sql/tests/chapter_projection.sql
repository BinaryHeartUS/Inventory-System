\set ON_ERROR_STOP on
-- Run as the migration owner on a disposable, freshly migrated database.
BEGIN;
SET LOCAL ROLE api_user;
SELECT Apply_Chapter_Directory('[{"id":1,"name":"National","active":true},
    {"id":90001,"name":"Projection A","active":true},
    {"id":90002,"name":"Projection B","active":true}]');
INSERT INTO Asset (ID, Chapter_ID) OVERRIDING SYSTEM VALUE VALUES (90001, 90001);

-- Swap names and deactivate without remapping a historical foreign key.
SELECT Apply_Chapter_Directory('[{"id":1,"name":"National","active":true},
    {"id":90001,"name":"Projection B","active":false},
    {"id":90002,"name":"Projection A","active":true}]');
DO $$
DECLARE
    before_sync TIMESTAMPTZ;
    invalid JSONB;
BEGIN
    IF NOT EXISTS (SELECT FROM Asset a JOIN Chapter c ON c.ID = a.Chapter_ID
        WHERE a.ID = 90001 AND c.ID = 90001 AND c.Name = 'Projection B' AND NOT c.Active) THEN
        RAISE EXCEPTION 'Historical asset/chapter identity was not preserved';
    END IF;
    SELECT Last_Success_At INTO STRICT before_sync FROM Chapter_Sync_State;
    FOR invalid IN SELECT value FROM jsonb_array_elements('[
        [],
        [{"id":1,"name":"National","active":true}],
        [{"id":1,"name":"Changed National","active":true},{"id":90001,"name":"National","active":true},{"id":90002,"name":"Projection A","active":true}],
        [{"id":1,"name":"National","active":false},{"id":90001,"name":"Projection B","active":false},{"id":90002,"name":"Projection A","active":true}],
        [{"id":1,"name":"National","active":true},{"id":90001,"name":"Duplicate","active":false},{"id":90002,"name":"Duplicate","active":true}],
        [{"id":1,"name":"National","active":true},{"id":90001,"name":"Projection B","active":false},{"id":90001,"name":"Projection A","active":true}],
        [{"id":1,"name":"National","active":true},{"id":90001,"name":"Projection B","active":"false"},{"id":90002,"name":"Projection A","active":true}]
    ]') LOOP
        BEGIN
            PERFORM Apply_Chapter_Directory(invalid);
            RAISE EXCEPTION 'Invalid snapshot was accepted' USING ERRCODE = 'XX000';
        EXCEPTION WHEN raise_exception THEN NULL;
        END;
        IF (SELECT Last_Success_At FROM Chapter_Sync_State) IS DISTINCT FROM before_sync
            OR (SELECT Active FROM Chapter WHERE ID = 90001) THEN
            RAISE EXCEPTION 'Failed synchronization changed the committed projection';
        END IF;
    END LOOP;
    BEGIN
        UPDATE Chapter SET Name = 'Unauthorized' WHERE ID = 90001;
        RAISE EXCEPTION 'api_user changed the chapter table directly';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        INSERT INTO Asset (Chapter_ID) VALUES (90001);
        RAISE EXCEPTION 'Inactive chapter accepted a new asset';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        UPDATE Asset SET Chapter_ID = 90002 WHERE ID = 90001;
        RAISE EXCEPTION 'Inactive chapter allowed an asset to be moved out';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        INSERT INTO Note (Text, Date, Asset_ID) VALUES ('Forbidden note', now(), 90001);
        RAISE EXCEPTION 'Inactive chapter accepted a note';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;
SELECT Apply_Chapter_Directory('[{"id":1,"name":"National","active":true},
    {"id":90001,"name":"Projection Renamed","active":true},
    {"id":90002,"name":"Projection A","active":true}]');
UPDATE Asset SET Chapter_ID = 90002 WHERE ID = 90001;
INSERT INTO Note (Text, Date, Asset_ID) VALUES ('Reactivated', now(), 90001);
SET LOCAL ROLE importer;
DO $$
BEGIN
    BEGIN
        INSERT INTO Chapter (Name) VALUES ('Forbidden importer chapter');
        RAISE EXCEPTION 'Importer created a local chapter';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
    BEGIN
        PERFORM Apply_Chapter_Directory('[]');
        RAISE EXCEPTION 'Importer executed the synchronization routine';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;
ROLLBACK;
