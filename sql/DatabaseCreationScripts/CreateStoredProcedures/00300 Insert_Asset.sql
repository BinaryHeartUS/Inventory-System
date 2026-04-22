CREATE OR REPLACE PROCEDURE Insert_Asset(
    IN p_Chapter_ID INTEGER,
    INOUT p_ID INTEGER = NULL,
    IN p_Aquisition_Date DATE = NULL,
    IN p_Value MONEY DEFAULT '0',
    IN p_Donor_ID INTEGER = NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_ID IS NULL THEN
        INSERT INTO Asset (Acquisition_Date, Value, Chapter_ID, Donor_ID)
        VALUES (p_Aquisition_Date, p_Value, p_Chapter_ID, p_Donor_ID)
        RETURNING ID INTO p_ID;
    ELSE
        INSERT INTO Asset (ID, Acquisition_Date, Value, Chapter_ID, Donor_ID)
        VALUES (p_ID, p_Aquisition_Date, p_Value, p_Chapter_ID, p_Donor_ID);
    END IF;
END;
$$;