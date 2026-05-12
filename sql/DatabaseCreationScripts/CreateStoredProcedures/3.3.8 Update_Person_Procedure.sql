DROP PROCEDURE IF EXISTS Update_Person;

CREATE OR REPLACE PROCEDURE Update_Person(
    IN p_ID INTEGER,
    IN p_Name Name_Type,
    IN p_Location Address,
    IN p_Email Email_Type
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Party
    SET Name = p_Name, Location = p_Location
    WHERE ID = p_ID;

    UPDATE Person
    SET Email = p_Email
    WHERE ID = p_ID;
END;
$$;
