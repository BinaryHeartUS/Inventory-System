CREATE OR REPLACE PROCEDURE Get_Volunteer_By_Username(
    IN p_username Name_Type,
    OUT p_id INTEGER,
    OUT p_password_hash VARCHAR(60),
    OUT p_role VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT ID, Password_Hash
    INTO p_id, p_password_hash
    FROM Volunteer
    WHERE Username = p_username;

    IF p_id IS NOT NULL THEN
        SELECT r.Name INTO p_role
        FROM Affiliated_With aw
        JOIN Role r ON r.ID = aw.Role_ID
        WHERE aw.Volunteer_ID = p_id
        ORDER BY r.Priority
        LIMIT 1;
    END IF;
END;
$$;
