CREATE OR REPLACE FUNCTION Get_Parts_By_Device (
    p_device_id INTEGER
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
    JOIN Asset a ON a.ID = p.ID
    JOIN Part_Type t ON p.Type_ID = t.ID
    WHERE p.Contained_In = p_device_id;
END;
$$;
