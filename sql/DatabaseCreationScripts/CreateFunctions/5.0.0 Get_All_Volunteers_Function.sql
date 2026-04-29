CREATE OR REPLACE FUNCTION Get_All_Volunteers()
RETURNS TABLE (
    ID INTEGER,
    Username VARCHAR(50),
    Name VARCHAR(50),
    Chapter_ID INTEGER,
    Role_Name VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.ID,
        v.Username,
        v.Name,
        aw.Chapter_ID,
        r.Name
    FROM Volunteer v
    JOIN Affiliated_With aw ON aw.Volunteer_ID = v.ID
    JOIN Role r ON r.ID = aw.Role_ID
    ORDER BY v.Username, r.Priority;
END;
$$;
