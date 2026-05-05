CREATE OR REPLACE FUNCTION Get_Part_By_ID (
	p_assetID INTEGER
)
RETURNS TABLE (
    ID INTEGER,
    Type_ID INTEGER,
    Description VARCHAR(500),
    Was_Purchased BOOLEAN,
    Contained_In INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.ID,
        p.Type_ID,
        p.Description,
        p.Was_Purchased,
        p.Contained_In
    FROM Part p
    WHERE p.ID = p_assetID;
END;
$$;
