DROP PROCEDURE IF EXISTS Update_Volunteer_Password;

CREATE OR REPLACE PROCEDURE Update_Volunteer_Password(
    IN p_volunteer_id INTEGER,
    IN p_password_hash VARCHAR(60),
    IN p_password_salt VARCHAR(60)
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1
                FROM Volunteer
                WHERE ID = p_volunteer_id) THEN
        UPDATE Volunteer
        SET Password_Hash = p_password_hash,
            Password_Salt = p_password_salt
        WHERE ID = p_volunteer_id;
    ELSE
        RAISE SQLSTATE '02000'
        USING MESSAGE = 'No volunteer found with matching ID';
    END IF;
END;
$$;
