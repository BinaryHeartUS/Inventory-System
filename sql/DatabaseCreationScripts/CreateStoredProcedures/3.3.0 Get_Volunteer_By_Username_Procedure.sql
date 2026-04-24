CREATE OR REPLACE PROCEDURE Get_Volunteer_By_Username(
    IN p_username Name_Type,
    OUT p_id INTEGER,
    OUT p_password_hash VARCHAR(60),
    OUT p_chapter_ids INTEGER[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_national_id INTEGER;
    v_is_national BOOLEAN = FALSE;
BEGIN
    SELECT ID, Password_Hash
    INTO p_id, p_password_hash
    FROM Volunteer
    WHERE Username = p_username;

    IF p_id IS NOT NULL THEN
        SELECT ID INTO v_national_id FROM Chapter WHERE Name = 'National';

        IF v_national_id IS NOT NULL THEN
            SELECT EXISTS(
                SELECT 1 FROM Affiliated_With
                WHERE Volunteer_ID = p_id AND Chapter_ID = v_national_id
            ) INTO v_is_national;
        END IF;

        IF v_is_national THEN
            SELECT ARRAY(SELECT ID FROM Chapter) INTO p_chapter_ids;
        ELSE
            SELECT ARRAY(
                SELECT Chapter_ID
                FROM Affiliated_With
                WHERE Volunteer_ID = p_id
            ) INTO p_chapter_ids;
        END IF;
    END IF;
END;
$$;
