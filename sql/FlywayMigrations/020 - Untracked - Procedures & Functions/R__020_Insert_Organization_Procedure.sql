DROP PROCEDURE IF EXISTS Insert_Organization;

CREATE OR REPLACE PROCEDURE Insert_Organization(
    OUT p_ID INTEGER,
    IN p_Name Name_Type,
    IN p_Location Address,
    IN p_ContactName Name_Type,
    IN p_ContactEmail Email_Type
)
LANGUAGE
plpgsql
AS $$
BEGIN
    SELECT ID INTO p_ID FROM Party WHERE Name = p_Name;

    IF p_ID IS NULL THEN
        CALL Insert_Party(p_ID, p_Name, p_Location);

        INSERT INTO Organization(ID, ContactName, ContactEmail)
        VALUES (p_ID, p_ContactName, p_ContactEmail)
        RETURNING ID INTO p_ID;
    END IF;
END;
$$;