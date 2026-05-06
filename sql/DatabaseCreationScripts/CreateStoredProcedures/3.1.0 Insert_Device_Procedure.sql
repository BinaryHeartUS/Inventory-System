DROP PROCEDURE IF EXISTS Insert_Device;

CREATE OR REPLACE PROCEDURE Insert_Device(
    IN p_Chapter_ID INTEGER,
    IN p_Manufacturer VARCHAR(50),
    IN p_Model varchar(50),
    IN p_Year INTEGER,
    IN p_Status Status,
    INOUT p_Asset_ID INTEGER = NULL,
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
    CALL Insert_Asset(p_Chapter_ID, p_Asset_ID, p_Acquisition_Date, p_Value, p_Donor_ID);

    CALL Insert_Manufacturer(p_Manufacturer, v_Manufacturer_ID);

    IF p_RAM_Generation IS NOT NULL THEN
        CALL Insert_Ram_Generation(p_RAM_Generation, v_RAM_Generation_ID);
    END IF;

    IF p_Storage_Type IS NOT NULL THEN
        CALL Insert_Storage_Type(p_Storage_Type, v_Storage_Type_ID);
    END IF;

    INSERT INTO Device(ID, Manufacturer_ID, Model, Year, CPU, RAM, RAM_Generation_ID, Storage_Amount, Storage_Type_ID, Status, Recipient_ID, Donated_Date)
    VALUES (p_Asset_ID, v_Manufacturer_ID, p_Model, p_Year, p_CPU, p_RAM, v_RAM_Generation_ID, p_Storage_Amount, v_Storage_Type_ID, p_Status, p_Recipient_ID, p_Donated_Date);
END;
$$;