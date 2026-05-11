DROP PROCEDURE IF EXISTS Insert_Party;

CREATE OR REPLACE PROCEDURE Insert_Party(
    INOUT p_ID INTEGER,
    IN p_Name Name_Type,
    IN p_Location Address
)
LANGUAGE
plpgsql
AS $$
BEGIN
    IF p_ID IS NULL THEN
        INSERT INTO Party (Name, Location)
        VALUES (p_Name, p_Location)
        RETURNING ID INTO p_ID;
    ELSE
        INSERT INTO Party (ID, Name, Location)
        VALUES (p_ID, p_Name, p_Location);
    END IF;
END;
$$;