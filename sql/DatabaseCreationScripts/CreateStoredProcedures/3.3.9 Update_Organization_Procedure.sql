DROP PROCEDURE IF EXISTS Update_Organization;

CREATE OR REPLACE PROCEDURE Update_Organization(
    IN p_ID INTEGER,
    IN p_Name Name_Type,
    IN p_Location Address,
    IN p_ContactName Name_Type,
    IN p_ContactEmail Email_Type
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Party
    SET Name = p_Name, Location = p_Location
    WHERE ID = p_ID;

    UPDATE Organization
    SET ContactName = p_ContactName,
        ContactEmail = p_ContactEmail
    WHERE ID = p_ID;
END;
$$;
