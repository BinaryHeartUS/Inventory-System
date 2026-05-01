CREATE OR REPLACE PROCEDURE Insert_Tool(
    IN p_Chapter_ID INTEGER,
    IN p_Tool_ID INTEGER,
    IN p_Description varchar(500),
    IN p_Acquisition_Date DATE = NULL,
    IN p_Value MONEY DEFAULT '0',
    IN p_Donor_ID INTEGER = NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    CALL Insert_Asset(p_Chapter_ID, p_Tool_ID, p_Acquisition_Date, p_Value, p_Donor_ID);

    INSERT INTO Tool(ID, Description)
    VALUES (p_Tool_ID, p_Description);
END;
$$;