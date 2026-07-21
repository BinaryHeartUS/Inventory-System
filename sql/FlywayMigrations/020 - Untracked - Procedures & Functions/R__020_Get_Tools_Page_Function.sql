DROP FUNCTION IF EXISTS Get_Tools_Page;

-- Paginated / filtered tool listing. All filtering lives here (no SQL strings in Java).
-- p_chapter_ids: NULL = all chapters. p_limit: NULL = no limit (export / fetch-all).
CREATE OR REPLACE FUNCTION Get_Tools_Page(
    p_chapter_ids INTEGER[] DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_donor_id INTEGER DEFAULT NULL,
    p_limit INTEGER DEFAULT NULL,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id INTEGER,
    acquisition_date DATE,
    value NUMERIC,
    description VARCHAR(500),
    chapter_id INTEGER,
    donor_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT gt.*
    FROM Get_Tools gt
    WHERE (p_chapter_ids IS NULL OR gt.chapter_id = ANY(p_chapter_ids))
      AND (p_donor_id IS NULL OR gt.donor_id = p_donor_id)
      -- Free-text search across every column of the row via the composite row cast.
      AND (p_search IS NULL OR p_search = '' OR gt::text ILIKE '%' || p_search || '%')
    ORDER BY gt.id ASC
    LIMIT p_limit OFFSET COALESCE(p_offset, 0);
END;
$$;
