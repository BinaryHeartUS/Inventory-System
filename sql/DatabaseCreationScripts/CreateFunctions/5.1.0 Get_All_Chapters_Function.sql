CREATE OR REPLACE FUNCTION Get_All_Chapters()
RETURNS TABLE (
    ID INTEGER,
    Name Name_Type
)
LANGUAGE plpgsql
AS $$
    SELECT ID, Name
    FROM Chapter
    ORDER BY Name;
$$;
