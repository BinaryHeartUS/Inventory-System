CREATE OR REPLACE PROCEDURE Insert_Note(
    IN p_Text VARCHAR(500),
    IN p_Date DATE,
    IN p_Asset_ID INTEGER,
    OUT p_Note_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Note (Text, Date, Asset_ID)
    VALUES (p_Text, p_Date, p_Asset_ID)
    RETURNING ID INTO p_Note_ID;
END;
$$;