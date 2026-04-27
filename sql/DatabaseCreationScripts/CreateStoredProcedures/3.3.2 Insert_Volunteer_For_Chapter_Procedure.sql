CREATE OR REPLACE PROCEDURE Insert_Volunteer_For_Chapter(
    IN p_name Name_Type,
    IN p_username Name_Type,
    IN p_password_hash VARCHAR(60),
    IN p_chapter_id INTEGER,
    IN p_role_name VARCHAR(100),
    OUT p_volunteer_id INTEGER
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

    INSERT INTO Volunteer (Name, Username, Password_Hash)
    VALUES (p_name, p_username, p_password_hash)
    RETURNING ID INTO p_volunteer_id;

    INSERT INTO Affiliated_With (Volunteer_ID, Chapter_ID, Role_ID)
    VALUES (p_volunteer_id, p_chapter_id, v_role_id);
END;
$$;
