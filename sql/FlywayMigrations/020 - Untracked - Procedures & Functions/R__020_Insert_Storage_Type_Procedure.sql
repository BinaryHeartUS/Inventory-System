DROP PROCEDURE IF EXISTS Insert_Storage_Type;

CREATE OR REPLACE PROCEDURE Insert_Storage_Type(
    IN p_Name VARCHAR(30),
    OUT p_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Storage_Type (Name)
    VALUES (p_Name)
    ON CONFLICT (Name) DO NOTHING;

    SELECT ID INTO p_ID
    FROM Storage_Type
    WHERE Name = p_Name;
END;
$$;
