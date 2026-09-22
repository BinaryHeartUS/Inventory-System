DROP FUNCTION IF EXISTS Get_Misc_Page;

CREATE OR REPLACE FUNCTION Get_Misc_Page(
    p_donor_id INTEGER,
    p_limit INTEGER DEFAULT NULL,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id INTEGER,
    acquisition_date DATE,
    value NUMERIC,
    description VARCHAR(500),
    donor_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT gm.*
    FROM Get_Misc_Assets gm
    WHERE gm.donor_id = p_donor_id
    ORDER BY gm.id ASC
    LIMIT p_limit OFFSET COALESCE(p_offset, 0);
END;
$$;