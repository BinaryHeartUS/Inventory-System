DROP PROCEDURE IF EXISTS Insert_Part_Type;

CREATE OR REPLACE PROCEDURE Insert_Part_Type(
    IN p_Name VARCHAR(50),
    OUT p_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Part_Type (Name)
    VALUES (p_Name)
    ON CONFLICT (Name) DO NOTHING;

    SELECT ID INTO p_ID
    FROM Part_Type
    WHERE Name = p_Name;
END;
$$;
