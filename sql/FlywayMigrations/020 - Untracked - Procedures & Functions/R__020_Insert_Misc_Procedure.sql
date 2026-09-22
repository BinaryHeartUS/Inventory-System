DROP PROCEDURE IF EXISTS Insert_Misc;

CREATE OR REPLACE PROCEDURE Insert_Misc(
    INOUT p_Misc_ID INTEGER,
    IN p_Description VARCHAR(500),
    IN p_Acquisition_Date DATE,
    IN p_Value MONEY,
    IN p_Donor_ID INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    national_chapter_id INTEGER;
BEGIN
    IF p_Donor_ID IS NULL THEN
        RAISE SQLSTATE '23502' USING MESSAGE = 'Misc assets require a donor';
    END IF;

    IF p_Value IS NULL THEN
        RAISE SQLSTATE '23502' USING MESSAGE = 'Misc assets require a value';
    END IF;

    SELECT ID INTO STRICT national_chapter_id
    FROM Chapter
    WHERE Name = 'National';

    CALL Insert_Asset(national_chapter_id, p_Misc_ID, p_Acquisition_Date, p_Value, p_Donor_ID);

    INSERT INTO Misc(ID, Description)
    VALUES (p_Misc_ID, p_Description);
END;
$$;