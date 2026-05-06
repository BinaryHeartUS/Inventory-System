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
    CALL Insert_Party(p_ID, p_Name, p_Location);

    IF (SELECT COUNT(*) FROM Organization WHERE ID = p_ID) = 0 THEN
        INSERT INTO Organization(ID, ContactName, ContactEmail)
        VALUES (p_ID, p_ContactName, p_ContactEmail);
    END IF;
END;
$$;