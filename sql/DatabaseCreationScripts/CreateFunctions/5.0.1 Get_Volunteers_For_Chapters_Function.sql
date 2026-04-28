CREATE OR REPLACE FUNCTION Get_Volunteers_For_Chapters(
    p_chapter_ids INTEGER[]
)
RETURNS TABLE (
    ID INTEGER,
    Username Name_Type,
    Name Name_Type,
    Chapter_ID INTEGER,
    Role_Name VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
    SELECT
        v.ID,
        v.Username,
        v.Name,
        aw.Chapter_ID,
        r.Name
    FROM Volunteer v
    JOIN Affiliated_With aw ON aw.Volunteer_ID = v.ID
    JOIN Role r ON r.ID = aw.Role_ID
    WHERE aw.Chapter_ID = ANY(p_chapter_ids)
    ORDER BY v.Username, r.Priority;
$$;
