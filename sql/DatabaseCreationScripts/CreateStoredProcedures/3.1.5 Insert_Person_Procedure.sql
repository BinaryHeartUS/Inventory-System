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
    CALL Insert_Party(p_ID, p_Name, p_Location);

    IF (SELECT COUNT(*) FROM Person WHERE ID = p_ID) = 0 THEN
        INSERT INTO Person(ID, Email)
        VALUES (p_ID, p_Email);
    END IF;
END;
$$;