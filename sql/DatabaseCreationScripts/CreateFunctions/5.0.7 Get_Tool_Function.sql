DROP FUNCTION IF EXISTS Get_Tool;

CREATE OR REPLACE FUNCTION Get_Tool(
    p_ID INTEGER
)
RETURNS TABLE (
    id INTEGER,
    acquisition_date DATE,
    value MONEY,
    description VARCHAR(500),
    chapter_id INTEGER,
    donor_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM Get_Tools gt
    WHERE gt.ID = p_ID;
END;
$$;