CREATE OR REPLACE PROCEDURE Update_Tablet(
    IN p_Chapter_ID INTEGER,
    IN p_Manufacturer VARCHAR(50),
    IN p_Model varchar(50),
    IN p_Year INTEGER,
    IN p_Status Status,
    IN p_Includes_Charger Charger_Status,
    IN p_Working_Battery Working_Battery,
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
BEGIN
    IF EXISTS (SELECT 1
                FROM Tablet
                WHERE id = p_Asset_ID) THEN
        CALL Update_Device(p_Chapter_ID, p_Manufacturer, p_Model, p_Year, p_Status, p_Asset_ID, p_CPU, p_RAM, p_RAM_Generation, p_Storage_Amount, p_Storage_Type, p_Value, p_Acquisition_Date, p_Recipient_ID, p_Donor_ID, p_Donated_Date);

        UPDATE Tablet
        SET Includes_Charger = p_Includes_Charger,
            Working_Battery = p_Working_Battery
        WHERE ID = p_Asset_ID;
    ELSE
        RAISE SQLSTATE '02000'
        USING MESSAGE = 'No tablet found with matching asset ID';
    END IF;
END;
$$;