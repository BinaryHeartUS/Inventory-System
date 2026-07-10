DROP PROCEDURE IF EXISTS Update_Affiliation;

CREATE OR REPLACE PROCEDURE Update_Affiliation(
    IN p_volunteer_id INTEGER,
    IN p_chapter_id INTEGER,
    IN p_role_name VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_role_id INTEGER;
BEGIN
    SELECT ID INTO v_role_id FROM Role WHERE Name = p_role_name;
    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Unknown role: %', p_role_name;
    END IF;

    UPDATE Affiliated_With
    SET Role_ID = v_role_id
    WHERE Volunteer_ID = p_volunteer_id AND Chapter_ID = p_chapter_id;
END;
$$;
