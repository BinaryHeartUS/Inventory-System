CREATE OR REPLACE PROCEDURE Delete_Affiliation(
    IN p_volunteer_id INTEGER,
    IN p_chapter_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM Affiliated_With
    WHERE Volunteer_ID = p_volunteer_id AND Chapter_ID = p_chapter_id;
END;
$$;
