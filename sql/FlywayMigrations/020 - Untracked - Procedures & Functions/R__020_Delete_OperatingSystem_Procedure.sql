DROP PROCEDURE IF EXISTS Delete_Operating_System;

CREATE OR REPLACE PROCEDURE Delete_Operating_System(
    IN p_Name VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM Operating_System WHERE Name = p_Name;
END;
$$;
