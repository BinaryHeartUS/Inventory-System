CREATE OR REPLACE FUNCTION Get_All_Chapters()
RETURNS TABLE (
    ID INTEGER,
    Name Name_Type
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT Chapter.ID, Chapter.Name
    FROM Chapter
    ORDER BY Chapter.Name;
END;
$$;