DROP PROCEDURE IF EXISTS Insert_Party;

CREATE OR REPLACE PROCEDURE Insert_Party(
    OUT p_ID INTEGER,
    IN p_Name Name_Type,
    IN p_Location Address
)
LANGUAGE
plpgsql
AS $$
BEGIN 
    SELECT ID INTO p_ID
    FROM Party
    WHERE Name = p_Name;

    IF p_ID IS NULL THEN
        INSERT INTO Party (Name, Location)
        VALUES (p_Name, p_Location)
        RETURNING ID INTO p_ID;
    END IF;
END;
$$;