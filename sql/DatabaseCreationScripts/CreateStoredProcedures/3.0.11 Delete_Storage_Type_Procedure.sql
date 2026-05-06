DROP PROCEDURE IF EXISTS Delete_Storage_Type;

CREATE OR REPLACE PROCEDURE Delete_Storage_Type(
    IN p_Name VARCHAR(30)
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM Storage_Type WHERE Name = p_Name;
END;
$$;
