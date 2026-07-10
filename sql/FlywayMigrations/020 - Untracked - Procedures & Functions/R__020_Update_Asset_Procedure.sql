DROP PROCEDURE IF EXISTS Update_Asset;

CREATE OR REPLACE PROCEDURE Update_Asset(
    IN p_Chapter_ID INTEGER,
    IN p_ID INTEGER,
    IN p_Acquisition_Date DATE = NULL,
    IN p_Value MONEY DEFAULT '0',
    IN p_Donor_ID INTEGER = NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Asset
    SET Acquisition_Date = p_Acquisition_Date,
        Value = p_Value,
        Chapter_ID = p_Chapter_ID,
        Donor_ID = p_Donor_ID
    WHERE ID = p_ID;
END;
$$;