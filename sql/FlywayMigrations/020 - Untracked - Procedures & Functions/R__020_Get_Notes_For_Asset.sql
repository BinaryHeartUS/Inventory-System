DROP FUNCTION IF EXISTS Get_Notes_For_Asset;

CREATE OR REPLACE FUNCTION Get_Notes_For_Asset(
    p_asset_id INTEGER
)
RETURNS TABLE (
    ID INTEGER,
    Text VARCHAR(500),
    Date DATE,
    Asset_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM Note n
    WHERE n.Asset_ID = p_asset_id
    ORDER BY n.Date DESC;
END;
$$;