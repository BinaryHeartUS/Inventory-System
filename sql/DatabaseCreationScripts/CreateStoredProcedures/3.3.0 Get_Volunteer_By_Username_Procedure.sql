CREATE OR REPLACE PROCEDURE Get_Volunteer_By_Username(
    IN p_username Name_Type,
    OUT p_id INTEGER,
    OUT p_password_hash VARCHAR(60),
    OUT p_chapter_ids INTEGER[]
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT ID, Password_Hash
    INTO p_id, p_password_hash
    FROM Volunteer
    WHERE Username = p_username;

    IF p_id IS NOT NULL THEN
        SELECT ARRAY(
            SELECT Chapter_ID
            FROM Affiliated_With
            WHERE Volunteer_ID = p_id
        ) INTO p_chapter_ids;
    END IF;
END;
$$;
