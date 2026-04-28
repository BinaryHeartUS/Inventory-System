CREATE OR REPLACE FUNCTION Get_Chapter_Roles_For_Volunteer(
    p_volunteer_id INTEGER
)
RETURNS TABLE (
    Chapter_ID INTEGER,
    Role_Name  VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
    SELECT aw.Chapter_ID, r.Name
    FROM Affiliated_With aw
    JOIN Role r ON r.ID = aw.Role_ID
    WHERE aw.Volunteer_ID = p_volunteer_id
    ORDER BY r.Priority;
$$;
