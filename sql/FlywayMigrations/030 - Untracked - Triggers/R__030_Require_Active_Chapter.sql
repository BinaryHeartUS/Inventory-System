CREATE OR REPLACE FUNCTION Require_Active_Inventory_Chapter()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
    chapter_ids INTEGER[];
    chapter_id INTEGER;
    chapter_active BOOLEAN;
BEGIN
    IF TG_TABLE_NAME = 'asset' THEN
        IF TG_OP = 'INSERT' THEN
            chapter_ids := ARRAY[NEW.chapter_id];
        ELSIF TG_OP = 'DELETE' THEN
            chapter_ids := ARRAY[OLD.chapter_id];
        ELSE
            chapter_ids := ARRAY[OLD.chapter_id, NEW.chapter_id];
        END IF;
    ELSE
        IF TG_OP = 'INSERT' THEN
            SELECT ARRAY[a.chapter_id] INTO chapter_ids FROM public.asset a WHERE a.id = NEW.asset_id;
        ELSIF TG_OP = 'DELETE' THEN
            SELECT ARRAY[a.chapter_id] INTO chapter_ids FROM public.asset a WHERE a.id = OLD.asset_id;
        ELSE
            SELECT array_agg(DISTINCT a.chapter_id) INTO chapter_ids
                FROM public.asset a WHERE a.id IN (OLD.asset_id, NEW.asset_id);
        END IF;
    END IF;
    -- Lock in ID order so a synchronization cannot deactivate a chapter during
    -- an inventory write, including moves between chapters.
    FOR chapter_id IN SELECT DISTINCT unnest(chapter_ids) ORDER BY 1 LOOP
        SELECT c.active INTO chapter_active FROM public.chapter c WHERE c.id = chapter_id FOR SHARE;
        IF chapter_active IS DISTINCT FROM true THEN
            RAISE EXCEPTION 'Cannot modify inventory in an inactive or unsynchronized chapter'
                USING ERRCODE = '42501';
        END IF;
    END LOOP;
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION Require_Active_Inventory_Chapter() FROM PUBLIC, api_user, importer;

DROP TRIGGER IF EXISTS Require_Active_Chapter ON Asset;
CREATE TRIGGER Require_Active_Chapter BEFORE INSERT OR UPDATE OR DELETE ON Asset
    FOR EACH ROW EXECUTE FUNCTION Require_Active_Inventory_Chapter();
DROP TRIGGER IF EXISTS Require_Active_Chapter ON Note;
CREATE TRIGGER Require_Active_Chapter BEFORE INSERT OR UPDATE OR DELETE ON Note
    FOR EACH ROW EXECUTE FUNCTION Require_Active_Inventory_Chapter();
