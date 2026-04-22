CREATE OR REPLACE PROCEDURE Insert_Laptop(
    IN p_Chapter_ID INTEGER,
    IN p_Manufacturer Manufacturer,
    IN p_Model varchar(30),
    IN p_Year INTEGER,
    IN p_Status Status,
    IN p_Includes_Charger Charger_Status,
    INOUT p_Asset_ID INTEGER = NULL,
    IN p_CPU varchar(30) = NULL,
    IN p_RAM INTEGER = 0,
    IN p_RAM_Generation Ram_Generation = NULL,
    IN p_Storage_Amount INTEGER = 0,
    IN p_Storage_Type Storage_Type = NULL,
    IN p_Value MONEY DEFAULT '0',
    IN p_Acquisition_Date DATE = NULL,
    IN p_Recipient_ID INTEGER = NULL,
    IN p_Donor_ID INTEGER = NULL,
    IN p_Design_Battery_Capacity INTEGER = NULL,
    IN p_Actual_Battery_Capacity INTEGER = NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    CALL Insert_Device(p_Chapter_ID, p_Manufacturer, p_Model, p_Year, p_Status, p_Asset_ID, p_CPU, p_RAM, p_RAM_Generation, p_Storage_Amount, p_Storage_Type, p_Value, p_Acquisition_Date, p_Recipient_ID, p_Donor_ID);

    INSERT INTO Laptop(ID, Design_Battery_Capacity, Actual_Battery_Capacity, Includes_Charger)
    VALUES (p_Asset_ID, p_Design_Battery_Capacity, p_Actual_Battery_Capacity, p_Includes_Charger);
END;
$$;