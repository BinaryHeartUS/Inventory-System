CREATE OR REPLACE PROCEDURE Insert_Role(
    IN p_Name VARCHAR(100),
    OUT p_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Role (Name)
    VALUES (p_Name)
    ON CONFLICT (Name) DO NOTHING;

    SELECT ID INTO p_ID
    FROM Role
    WHERE Name = p_Name;
END;
$$;
