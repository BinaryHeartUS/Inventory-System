CREATE OR REPLACE PROCEDURE Insert_Device(
    IN p_Chapter_ID INTEGER,
    IN p_Manufacturer Manufacturer,
    IN p_Model varchar(50),
    IN p_Year INTEGER,
    IN p_Status Status,
    INOUT p_Asset_ID INTEGER = NULL,
    IN p_CPU varchar(50) = NULL,
    IN p_RAM INTEGER = 0,
    IN p_RAM_Generation Ram_Generation = NULL,
    IN p_Storage_Amount INTEGER = 0,
    IN p_Storage_Type Storage_Type = NULL,
    IN p_Value MONEY DEFAULT '0',
    IN p_Acquisition_Date DATE = NULL,
    IN p_Recipient_ID INTEGER = NULL,
    IN p_Donor_ID INTEGER = NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    CALL Insert_Asset(p_Chapter_ID, p_Asset_ID, p_Acquisition_Date, p_Value, p_Donor_ID);

    INSERT INTO Device(ID, Manufacturer, Model, Year, CPU, RAM, RAM_Generation, Storage_Amount, Storage_Type, Status, Recipient_ID)
    VALUES (p_Asset_ID, p_Manufacturer, p_Model, p_Year, p_CPU, p_RAM, p_RAM_Generation, p_Storage_Amount, p_Storage_Type, p_Status, p_Recipient_ID);
END;
$$;