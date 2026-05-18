DROP FUNCTION IF EXISTS Get_Device_Changelog_By_ID;

CREATE OR REPLACE FUNCTION Get_Device_Changelog_By_ID (
    p_assetID INTEGER
)
RETURNS TABLE (
    Device_Type VARCHAR(10),
    Device_ID INTEGER,
    Modified_By Name_Type,
    Modified_At TIMESTAMPTZ,
    Change_Type Change_Type,
    Old_Acquisition_Date DATE,
    New_Acquisition_Date DATE,
    Old_Value MONEY,
    New_Value MONEY
    Old_Chapter_ID INTEGER,
    New_Chapter_ID INTEGER
    Old_Donor_ID INTEGER,
    New_Donor_ID INTEGER,
    Old_Manufacturer VARCHAR(50),
    New_Manufacturer VARCHAR(50),
    Old_Model VARCHAR(50),
    New_Model VARCHAR(50),
    Old_Year INTEGER,
    New_Year INTEGER,
    Old_CPU VARCHAR(50),
    New_CPU VARCHAR(50),
    Old_RAM INTEGER,
    New_RAM INTEGER,
    Old_RAM_Generation VARCHAR(20),
    New_RAM_Generation VARCHAR(20),
    Old_Storage_Amount INTEGER,
    New_Storage_Amount INTEGER,
    Old_Storage_Type VARCHAR(30),
    New_Storage_Type VARCHAR(30),
    Old_Status STATUS,
    New_Status STATUS,
    Old_HasWifi BOOLEAN,
    New_HasWifi BOOLEAN,
    Old_Includes_Charger CHARGER_STATUS,
    New_Includes_Charger CHARGER_STATUS,
    Old_Design_Capacity INTEGER,
    New_Design_Capacity INTEGER,
    Old_Actual_Capacity INTEGER,
    New_Actual_Capacity INTEGER,
    Old_Battery_Health NUMERIC,
    New_Battery_Health NUMERIC,
    Old_Working_Battery WORKING_BATTERY,
    New_Working_Battery WORKING_BATTERY,
    Old_Donated_Date DATE,
    New_Donated_Date DATE,
    Old_Operating_System VARCHAR(50),
    New_Operating_System VARCHAR(50),
    Old_Recipient_ID INTEGER,
    New_Recipient_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        Get_Device_Type(deviceLog.device_ID) as type,
        deviceLog.Device_ID,
        deviceLog.Modified_By,
        deviceLog.Modified_At,
        deviceLog.Change_Type,
        assetLog.Old_Acquisition_Date,
        assetLog.New_Acquisition_Date,
        assetLog.Old_Value,
        assetLog.New_Value,
        assetLog.Old_Chapter_ID,
        assetLog.New_Chapter_ID,
        assetLog.Old_Donor_ID,
        assetLog.New_Donor_ID,
        oldManf.Name AS Old_Manufacturer,
        newManf.Name AS New_Manufacturer,
        deviceLog.Old_Model,
        deviceLog.New_Model,
        deviceLog.Old_Year,
        deviceLog.New_Year,
        deviceLog.Old_CPU,
        deviceLog.New_CPU,
        deviceLog.Old_RAM,
        deviceLog.New_RAM,
        oldRAM.Name AS Old_RAM_Generation,
        newRAM.Name AS New_RAM_Generation,
        deviceLog.Old_Storage_Amount,
        deviceLog.New_Storage_Amount,
        oldStorage_Type.Name AS Old_Storage_Type,
        newStorage_Type.Name AS New_Storage_Type,
        deviceLog.Old_Status,
        deviceLog.New_Status,
        desktopLog.Old_HasWifi,
        desktopLog.New_HasWifi,
        Get_Charger_Status(laptopLog.Laptop_ID, tabletLog.Tablet_ID, laptopLog.Old_Includes_Charger, tabletLog.Old_Includes_Charger) AS Old_Includes_Charger,
        Get_Charger_Status(laptopLog.Laptop_ID, tabletLog.Tablet_ID, laptopLog.New_Includes_Charger, tabletLog.New_Includes_Charger) AS New_Includes_Charger,
        laptopLog.Old_Design_Battery_Capacity,
        laptopLog.New_Design_Battery_Capacity,
        laptopLog.Old_Actual_Battery_Capacity,
        laptopLog.New_Actual_Battery_Capacity,
        laptopLog.Old_Battery_Health,
        laptopLog.New_Battery_Health,
        tabletLog.Old_Working_Battery,
        tabletLog.New_Working_Battery,
        deviceLog.Old_Donated_Date,
        deviceLog.New_Donated_Date,
        oldOS.Name AS Old_Operating_System,
        newOS.Name AS New_Operating_System,
        deviceLog.Old_Recipient_ID,
        deviceLog.New_Recipient_ID
    FROM Device_Change_Log deviceLog
    FULL JOIN Asset_Change_Log assetLog ON deviceLog.transaction_id = assetLog.transaction_id
    FULL JOIN Desktop_Change_Log desktopLog ON deviceLog.transaction_id = desktopLog.transaction_id
    FULL JOIN Laptop_Change_Log laptopLog ON deviceLog.transaction_id = laptopLog.transaction_id
    FULL JOIN Tablet_Change_Log tabletLog ON deviceLog.transaction_id = tabletLog.transaction_id
    LEFT JOIN Manufacturer oldManf ON deviceLog.Old_Manufacturer_ID = oldManf.ID
    LEFT JOIN Manufacturer newManf ON deviceLog.New_Manufacturer_ID = newManf.ID
    LEFT JOIN RAM_generation oldRAM ON deviceLog.Old_RAM_Generation_ID = oldRAM.ID
    LEFT JOIN RAM_generation newRAM ON deviceLog.New_RAM_Generation_ID = newRAM.ID
    LEFT JOIN Storage_Type oldStorage_Type ON deviceLog.Old_Storage_Type_ID = oldStorage_Type.ID
    LEFT JOIN Storage_Type newStorage_Type ON deviceLog.New_Storage_Type_ID = newStorage_Type.ID
    LEFT JOIN Operating_System oldOS ON deviceLog.Old_OS_ID = oldOS.ID
    LEFT JOIN Operating_System newOS ON deviceLog.New_OS_ID = newOS.ID
    WHERE deviceLog.Device_ID = p_assetID
END;
$$;