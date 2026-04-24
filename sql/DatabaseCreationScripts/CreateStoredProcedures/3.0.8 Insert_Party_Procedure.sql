CREATE OR REPLACE PROCEDURE Insert_Party(
    OUT p_ID INTEGER,
    IN p_Name Name_Type,
    IN p_Location Address
)
LANGUAGE
plpgsql
AS $$
BEGIN
    INSERT INTO Party (ID, Name, Location)
    VALUES (p_ID, p_Name, p_Location)
    RETURNING ID INTO p_ID;
END;
$$;