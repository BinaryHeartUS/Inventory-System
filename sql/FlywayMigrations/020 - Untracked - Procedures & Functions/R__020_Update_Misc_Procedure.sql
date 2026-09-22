DROP PROCEDURE IF EXISTS Update_Misc;

CREATE OR REPLACE PROCEDURE Update_Misc(
    IN p_Misc_ID INTEGER,
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

    IF NOT EXISTS (SELECT 1 FROM Misc WHERE ID = p_Misc_ID) THEN
        RAISE SQLSTATE '02000'
        USING MESSAGE = 'No misc asset found with matching asset ID';
    END IF;

    SELECT ID INTO STRICT national_chapter_id
    FROM Chapter
    WHERE Name = 'National';

    CALL Update_Asset(national_chapter_id, p_Misc_ID, COALESCE(p_Acquisition_Date, CURRENT_DATE), p_Value,
        p_Donor_ID);

    UPDATE Misc
    SET Description = p_Description
    WHERE ID = p_Misc_ID;
END;
$$;