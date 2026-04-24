CREATE OR REPLACE PROCEDURE Insert_Tool_Type(
    IN p_Name VARCHAR(50),
    OUT p_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Tool_Type (Name)
    Values (p_Name)
    ON CONFLICT (Name) DO NOTHING;

    SELECT ID INTO p_ID
    FROM Tool_Type
    WHERE Name = p_Name;
END;
$$;