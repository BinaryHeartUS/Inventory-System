DROP FUNCTION IF EXISTS Get_Part_Type_Counts;

CREATE OR REPLACE FUNCTION Get_Part_Type_Counts(
    p_chapter_ids INTEGER[] DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_type TEXT DEFAULT NULL,
    p_source TEXT DEFAULT NULL,
    p_include_in_device BOOLEAN DEFAULT TRUE,
    p_donor_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    part_type VARCHAR(50),
    part_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT gp.type, COUNT(*)::INTEGER
    FROM Get_Parts gp
    WHERE (p_chapter_ids IS NULL OR gp.chapterId = ANY(p_chapter_ids))
      AND (p_type IS NULL OR gp.type = p_type)
      AND (p_source IS NULL OR
           (p_source = 'purchased' AND gp.wasPurchased) OR
           (p_source = 'donated' AND NOT gp.wasPurchased))
      AND (p_include_in_device OR gp.containedIn IS NULL)
      AND (p_donor_id IS NULL OR gp.donorId = p_donor_id)
      AND (p_search IS NULL OR p_search = '' OR gp::text ILIKE '%' || p_search || '%')
    GROUP BY gp.type
    ORDER BY gp.type;
END;
$$;
