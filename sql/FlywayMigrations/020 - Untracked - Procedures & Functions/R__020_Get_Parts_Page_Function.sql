DROP FUNCTION IF EXISTS Get_Parts_Page;

-- Paginated / filtered part listing. All filtering lives here (no SQL strings in Java).
-- p_chapter_ids: NULL = all chapters. p_source: 'donated' | 'purchased' | NULL (all).
-- p_include_in_device: when FALSE, only parts not contained in a device are returned.
-- p_limit: NULL = no limit (export / fetch-all). Ordered by type then id so type groups
-- stay contiguous across pages for the grouped Parts view.
CREATE OR REPLACE FUNCTION Get_Parts_Page(
    p_chapter_ids INTEGER[] DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_type TEXT DEFAULT NULL,
    p_source TEXT DEFAULT NULL,
    p_include_in_device BOOLEAN DEFAULT TRUE,
    p_donor_id INTEGER DEFAULT NULL,
    p_limit INTEGER DEFAULT NULL,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id INTEGER,
    type VARCHAR(50),
    description VARCHAR(500),
    wasPurchased BOOLEAN,
    containedIn INTEGER,
    chapterId INTEGER,
    acquisitionDate DATE,
    value NUMERIC,
    donorId INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT gp.*
    FROM Get_Parts gp
    WHERE (p_chapter_ids IS NULL OR gp.chapterId = ANY(p_chapter_ids))
      AND (p_type IS NULL OR gp.type = p_type)
      AND (p_source IS NULL OR
           (p_source = 'purchased' AND gp.wasPurchased) OR
           (p_source = 'donated' AND NOT gp.wasPurchased))
      AND (p_include_in_device OR gp.containedIn IS NULL)
      AND (p_donor_id IS NULL OR gp.donorId = p_donor_id)
      -- Free-text search across every column of the row via the composite row cast.
      AND (p_search IS NULL OR p_search = '' OR gp::text ILIKE '%' || p_search || '%')
    ORDER BY gp.type ASC, gp.id ASC
    LIMIT p_limit OFFSET COALESCE(p_offset, 0);
END;
$$;
