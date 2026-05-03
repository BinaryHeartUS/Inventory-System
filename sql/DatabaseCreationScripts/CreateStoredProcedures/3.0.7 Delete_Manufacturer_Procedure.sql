CREATE OR REPLACE PROCEDURE Delete_Manufacturer(
    IN p_Name VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM Manufacturer WHERE Name = p_Name;
END;
$$;
