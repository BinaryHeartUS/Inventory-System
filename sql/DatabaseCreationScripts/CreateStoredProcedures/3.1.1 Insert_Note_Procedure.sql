CREATE OR REPLACE PROCEDURE Insert_Note(
    IN p_Text VARCHAR(500),
    IN p_Date TIMESTAMPTZ,
    IN p_Asset_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Note (Text, Date, Asset_ID)
    VALUES (p_Text, p_Date, p_Asset_ID);
END;
$$;