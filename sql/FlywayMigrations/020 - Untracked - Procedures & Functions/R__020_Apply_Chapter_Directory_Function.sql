CREATE OR REPLACE FUNCTION Apply_Chapter_Directory(p_chapters JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
    item JSONB;
    chapter_count INTEGER;
BEGIN
    IF jsonb_typeof(p_chapters) IS DISTINCT FROM 'array'
        OR jsonb_array_length(p_chapters) = 0 OR jsonb_array_length(p_chapters) > 10000 THEN
        RAISE EXCEPTION 'Invalid chapter directory';
    END IF;
    FOR item IN SELECT value FROM jsonb_array_elements(p_chapters) LOOP
        IF jsonb_typeof(item->'id') IS DISTINCT FROM 'number'
            OR (item->>'id') !~ '^[1-9][0-9]*$'
            OR (item->>'id')::numeric >= 2147483647
            OR jsonb_typeof(item->'name') IS DISTINCT FROM 'string'
            OR length(btrim(item->>'name')) NOT BETWEEN 1 AND 50
            OR item->>'name' <> btrim(item->>'name')
            OR jsonb_typeof(item->'active') IS DISTINCT FROM 'boolean' THEN
            RAISE EXCEPTION 'Invalid chapter directory entry';
        END IF;
    END LOOP;
    IF EXISTS (
        SELECT FROM jsonb_to_recordset(p_chapters) AS c(id INTEGER, name TEXT, active BOOLEAN)
        GROUP BY id HAVING count(*) > 1
    ) OR EXISTS (
        SELECT FROM jsonb_to_recordset(p_chapters) AS c(id INTEGER, name TEXT, active BOOLEAN)
        GROUP BY name HAVING count(*) > 1
    ) OR (SELECT count(*) FROM jsonb_to_recordset(p_chapters)
        AS c(id INTEGER, name TEXT, active BOOLEAN) WHERE name = 'National' AND active) <> 1 THEN
        RAISE EXCEPTION 'Duplicate chapters or missing active National chapter';
    END IF;

    LOCK TABLE public.chapter IN EXCLUSIVE MODE;
    -- Never infer deletion or remap IDs: local rows may have inventory references.
    IF EXISTS (
        SELECT FROM public.chapter old
        WHERE NOT EXISTS (SELECT FROM jsonb_to_recordset(p_chapters)
            AS c(id INTEGER, name TEXT, active BOOLEAN) WHERE c.id = old.id)
    ) OR EXISTS (
        SELECT FROM public.chapter old
        JOIN jsonb_to_recordset(p_chapters) AS c(id INTEGER, name TEXT, active BOOLEAN) ON c.id = old.id
        WHERE (old.name = 'National') <> (c.name = 'National')
    ) THEN
        RAISE EXCEPTION 'Directory omits local chapters or changes the National ID; reconcile IDs with auth';
    END IF;

    -- Auth may have renamed two chapters between polls; defer name uniqueness
    -- until the full snapshot has been applied.
    SET CONSTRAINTS public.chapter_name_key DEFERRED;
    INSERT INTO public.chapter (id, name, active)
        OVERRIDING SYSTEM VALUE
        SELECT id, name, active FROM jsonb_to_recordset(p_chapters)
            AS c(id INTEGER, name TEXT, active BOOLEAN)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, active = EXCLUDED.active
        WHERE (chapter.name, chapter.active) IS DISTINCT FROM (EXCLUDED.name, EXCLUDED.active);
    SET CONSTRAINTS public.chapter_name_key IMMEDIATE;
    INSERT INTO public.chapter_sync_state(id, last_success_at) VALUES (true, clock_timestamp())
        ON CONFLICT(id) DO UPDATE SET last_success_at = EXCLUDED.last_success_at;
    SELECT count(*) INTO chapter_count FROM public.chapter;
    RETURN chapter_count;
END;
$$;
REVOKE ALL ON FUNCTION Apply_Chapter_Directory(JSONB) FROM PUBLIC, importer;
GRANT EXECUTE ON FUNCTION Apply_Chapter_Directory(JSONB) TO api_user;
