DROP PROCEDURE IF EXISTS Insert_Operating_System;

CREATE OR REPLACE PROCEDURE Insert_Operating_System(
    IN p_Name VARCHAR(50),
    OUT p_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Operating_System (Name)
    VALUES (p_Name)
    ON CONFLICT (Name) DO NOTHING;

    SELECT ID INTO p_ID
    FROM Operating_System
    WHERE Name = p_Name;
END;
$$;
