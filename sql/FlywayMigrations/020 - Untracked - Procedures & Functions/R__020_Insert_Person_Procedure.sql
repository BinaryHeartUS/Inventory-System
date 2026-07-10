DROP PROCEDURE IF EXISTS Insert_Person;

CREATE OR REPLACE PROCEDURE Insert_Person(
    OUT p_ID INTEGER,
    IN p_Name Name_Type,
    IN p_Location Address,
    IN p_Email Email_Type
)
LANGUAGE
plpgsql
AS $$
BEGIN
    SELECT ID INTO p_ID FROM Party WHERE Name = p_Name;

    IF p_ID IS NULL THEN
        CALL Insert_Party(p_ID, p_Name, p_Location);

        INSERT INTO Person(ID, Email)
        VALUES (p_ID, p_Email)
        RETURNING ID into p_ID;
    END IF;
END;
$$;