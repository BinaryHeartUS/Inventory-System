DROP PROCEDURE IF EXISTS Update_Tool;

CREATE OR REPLACE PROCEDURE Update_Tool(
    IN p_Chapter_ID INTEGER,
    IN p_Asset_ID INTEGER,
    IN p_Description varchar(500),
    IN p_Acquisition_Date DATE = NULL,
    IN p_Value MONEY DEFAULT '0',
    IN p_Donor_ID INTEGER = NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1
                FROM Tool
                WHERE ID = p_Asset_ID) THEN
        CALL Update_Asset(p_Chapter_ID, p_Asset_ID, p_Acquisition_Date, p_Value, p_Donor_ID);

        UPDATE Tool
        SET Description = p_Description
        WHERE ID = p_Asset_ID;
    ELSE
        RAISE SQLSTATE '02000'
        USING MESSAGE = 'No tool found with matching asset ID';
    END IF;
END;
$$;