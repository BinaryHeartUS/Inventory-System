DROP PROCEDURE IF EXISTS Insert_Affiliation;

CREATE OR REPLACE PROCEDURE Insert_Affiliation(
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

    INSERT INTO Affiliated_With (Volunteer_ID, Chapter_ID, Role_ID)
    VALUES (p_volunteer_id, p_chapter_id, v_role_id);
END;
$$;
