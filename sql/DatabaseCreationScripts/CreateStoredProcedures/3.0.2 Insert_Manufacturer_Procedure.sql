CREATE OR REPLACE PROCEDURE Insert_Manufacturer(
    IN p_Name VARCHAR(50),
    OUT p_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Manufacturer (Name)
    VALUES (p_Name)
    ON CONFLICT (Name) DO NOTHING;

    SELECT ID INTO p_ID
    FROM Manufacturer
    WHERE Name = p_Name;
END;
$$;
