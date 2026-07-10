DROP PROCEDURE IF EXISTS Insert_Role;

CREATE OR REPLACE PROCEDURE Insert_Role(
    IN p_Name VARCHAR(100),
    IN p_Priority INTEGER,
    OUT p_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Role (Name, Priority)
    VALUES (p_Name, p_Priority)
    ON CONFLICT (Name) DO NOTHING;

    SELECT ID INTO p_ID
    FROM Role
    WHERE Name = p_Name;
END;
$$;
