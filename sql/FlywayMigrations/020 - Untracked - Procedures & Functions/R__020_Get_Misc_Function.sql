DROP FUNCTION IF EXISTS Get_Misc;

CREATE OR REPLACE FUNCTION Get_Misc(
    p_ID INTEGER
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
    SELECT *
    FROM Get_Misc_Assets gm
    WHERE gm.ID = p_ID;
END;
$$;