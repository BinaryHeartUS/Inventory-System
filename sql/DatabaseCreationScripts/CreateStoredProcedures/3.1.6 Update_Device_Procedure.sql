CREATE OR REPLACE PROCEDURE Update_Device(
    IN p_Chapter_ID INTEGER,
    IN p_Manufacturer VARCHAR(50),
    IN p_Model varchar(50),
    IN p_Year INTEGER,
    IN p_Status Status,
    IN p_Asset_ID INTEGER,
    IN p_CPU varchar(50) = NULL,
    IN p_RAM INTEGER = 0,
    IN p_RAM_Generation VARCHAR(20) = NULL,
    IN p_Storage_Amount INTEGER = 0,
    IN p_Storage_Type VARCHAR(30) = NULL,
    IN p_Value MONEY DEFAULT '0',
    IN p_Acquisition_Date DATE = NULL,
    IN p_Recipient_ID INTEGER = NULL,
    IN p_Donor_ID INTEGER = NULL,
    IN p_Donated_Date DATE = NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_Manufacturer_ID    INTEGER;
    v_RAM_Generation_ID  INTEGER;
    v_Storage_Type_ID    INTEGER;
BEGIN
    CALL Update_Asset(p_Chapter_ID, p_Asset_ID, p_Acquisition_Date, p_Value, p_Donor_ID);

    CALL Insert_Manufacturer(p_Manufacturer, v_Manufacturer_ID);

    IF p_RAM_Generation IS NOT NULL THEN
        CALL Insert_Ram_Generation(p_RAM_Generation, v_RAM_Generation_ID);
    END IF;

    IF p_Storage_Type IS NOT NULL THEN
        CALL Insert_Storage_Type(p_Storage_Type, v_Storage_Type_ID);
    END IF;

    UPDATE Device
    SET Manufacturer_ID = v_Manufacturer_ID,
        Model = p_Model,
        Year = p_Year,
        CPU = p_CPU,
        RAM = p_RAM,
        RAM_Generation_ID = v_RAM_Generation_ID,
        Storage_Amount = p_Storage_Amount,
        Storage_Type_ID = v_Storage_Type_ID,
        Status = p_Status,
        Recipient_ID = p_Recipient_ID,
        Donated_Date = p_Donated_Date
    WHERE ID = p_Asset_ID;
END;
$$;