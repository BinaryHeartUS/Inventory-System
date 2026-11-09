DROP PROCEDURE IF EXISTS Insert_Note;

CREATE OR REPLACE PROCEDURE Insert_Note(
    IN p_Text VARCHAR(500),
    IN p_Date TIMESTAMPTZ,
    IN p_Asset_ID INTEGER,
    in p_Author_ID INTEGER,
    OUT p_Note_ID INTEGER,
    OUT p_Author_Name TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Note (Text, Date, Asset_ID, Author_ID)
    VALUES (p_Text, p_Date, p_Asset_ID, p_Author_ID)
    RETURNING ID INTO p_Note_ID;

    --select the first/last name as well (double check)
    select v.Name
    into p_Author_Name
    from Volunteer v
    where v.ID = p_Author_ID;
END;
$$;
