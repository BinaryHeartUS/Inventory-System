CREATE OR REPLACE PROCEDURE Delete_Part_Type(
    IN p_Name VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM Part_Type WHERE Name = p_Name;
END;
$$;
