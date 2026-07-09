DROP FUNCTION IF EXISTS Get_Part_By_ID;

CREATE OR REPLACE FUNCTION Get_Part_By_ID (
	p_assetID INTEGER
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
    SELECT *
    FROM Get_Parts gp
    WHERE gp.ID = p_assetID;
END;
$$;
