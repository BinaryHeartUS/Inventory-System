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
    value MONEY,
    donorId INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.ID as id,
        t.Name as type,
        p.Description as description,
        p.Was_Purchased as wasPurchased,
        p.Contained_In as containedIn,
        a.Chapter_ID as chapterId,
        a.Acquisition_Date as acquisitionDate,
        a.Value as value,
        a.Donor_ID as donorId
    FROM Part p
    JOIN Asset a on a.ID = p.id
    JOIN Part_Type t on p.Type_ID = t.ID
    WHERE p.ID = p_assetID;
END;
$$;
