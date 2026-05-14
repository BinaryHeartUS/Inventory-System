CREATE OR REPLACE FUNCTION Update_Device_Change_Log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO Device_Change_Log(Device_ID, Modified_By, Change_Type,
            New_Manufacturer_ID, New_Model, New_Year, New_CPU, New_RAM, New_RAM_Generation_ID,
            New_Storage_Amount, New_Storage_Type_ID, New_Status,
            New_Recipient_ID, New_Donated_Date, New_OS_ID)
        VALUES (NEW.ID, COALESCE(current_setting('app.current_username', true), current_user),
            'Insert',
            NEW.Manufacturer_ID, NEW.Model, NEW.Year,
            NEW.CPU, NEW.RAM, NEW.RAM_Generation_ID,
            NEW.Storage_Amount, NEW.Storage_Type_ID,
            NEW.Status, NEW.Recipient_ID,
            NEW.Donated_Date, NEW.OS_ID);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.Manufacturer_ID IS DISTINCT FROM NEW.Manufacturer_ID OR
           OLD.Model IS DISTINCT FROM NEW.Model OR
           OLD.Year IS DISTINCT FROM NEW.Year OR
           OLD.CPU IS DISTINCT FROM NEW.CPU OR
           OLD.RAM IS DISTINCT FROM NEW.RAM OR
           OLD.RAM_Generation_ID IS DISTINCT FROM NEW.RAM_Generation_ID OR
           OLD.Storage_Amount IS DISTINCT FROM NEW.Storage_Amount OR
           OLD.Storage_Type_ID IS DISTINCT FROM NEW.Storage_Type_ID OR
           OLD.Status IS DISTINCT FROM NEW.Status OR
           OLD.Recipient_ID IS DISTINCT FROM NEW.Recipient_ID OR
           OLD.Donated_Date IS DISTINCT FROM NEW.Donated_Date OR
           OLD.OS_ID IS DISTINCT FROM NEW.OS_ID THEN
            INSERT INTO Device_Change_Log(Device_ID, Modified_By, Change_Type,
                Old_Manufacturer_ID, New_Manufacturer_ID,
                Old_Model, New_Model,
                Old_Year, New_Year,
                Old_CPU, New_CPU,
                Old_RAM, New_RAM,
                Old_RAM_Generation_ID, New_RAM_Generation_ID,
                Old_Storage_Amount, New_Storage_Amount,
                Old_Storage_Type_ID, New_Storage_Type_ID,
                Old_Status, New_Status,
                Old_Recipient_ID, New_Recipient_ID,
                Old_Donated_Date, New_Donated_Date,
                Old_OS_ID, New_OS_ID)
            VALUES (NEW.ID, COALESCE(current_setting('app.current_username', true), current_user),
                'Update',
                CASE WHEN OLD.Manufacturer_ID IS DISTINCT FROM NEW.Manufacturer_ID THEN OLD.Manufacturer_ID END,
                CASE WHEN OLD.Manufacturer_ID IS DISTINCT FROM NEW.Manufacturer_ID THEN NEW.Manufacturer_ID END,
                CASE WHEN OLD.Model IS DISTINCT FROM NEW.Model THEN OLD.Model END,
                CASE WHEN OLD.Model IS DISTINCT FROM NEW.Model THEN NEW.Model END,
                CASE WHEN OLD.Year IS DISTINCT FROM NEW.Year THEN OLD.Year END,
                CASE WHEN OLD.Year IS DISTINCT FROM NEW.Year THEN NEW.Year END,
                CASE WHEN OLD.CPU IS DISTINCT FROM NEW.CPU THEN OLD.CPU END,
                CASE WHEN OLD.CPU IS DISTINCT FROM NEW.CPU THEN NEW.CPU END,
                CASE WHEN OLD.RAM IS DISTINCT FROM NEW.RAM THEN OLD.RAM END,
                CASE WHEN OLD.RAM IS DISTINCT FROM NEW.RAM THEN NEW.RAM END,
                CASE WHEN OLD.RAM_Generation_ID IS DISTINCT FROM NEW.RAM_Generation_ID THEN OLD.RAM_Generation_ID END,
                CASE WHEN OLD.RAM_Generation_ID IS DISTINCT FROM NEW.RAM_Generation_ID THEN NEW.RAM_Generation_ID END,
                CASE WHEN OLD.Storage_Amount IS DISTINCT FROM NEW.Storage_Amount THEN OLD.Storage_Amount END,
                CASE WHEN OLD.Storage_Amount IS DISTINCT FROM NEW.Storage_Amount THEN NEW.Storage_Amount END,
                CASE WHEN OLD.Storage_Type_ID IS DISTINCT FROM NEW.Storage_Type_ID THEN OLD.Storage_Type_ID END,
                CASE WHEN OLD.Storage_Type_ID IS DISTINCT FROM NEW.Storage_Type_ID THEN NEW.Storage_Type_ID END,
                CASE WHEN OLD.Status IS DISTINCT FROM NEW.Status THEN OLD.Status END,
                CASE WHEN OLD.Status IS DISTINCT FROM NEW.Status THEN NEW.Status END,
                CASE WHEN OLD.Recipient_ID IS DISTINCT FROM NEW.Recipient_ID THEN OLD.Recipient_ID END,
                CASE WHEN OLD.Recipient_ID IS DISTINCT FROM NEW.Recipient_ID THEN NEW.Recipient_ID END,
                CASE WHEN OLD.Donated_Date IS DISTINCT FROM NEW.Donated_Date THEN OLD.Donated_Date END,
                CASE WHEN OLD.Donated_Date IS DISTINCT FROM NEW.Donated_Date THEN NEW.Donated_Date END,
                CASE WHEN OLD.OS_ID IS DISTINCT FROM NEW.OS_ID THEN OLD.OS_ID END,
                CASE WHEN OLD.OS_ID IS DISTINCT FROM NEW.OS_ID THEN NEW.OS_ID END);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO Device_Change_Log(Device_ID, Modified_By, Change_Type, Old_Manufacturer_ID,
            Old_Model, Old_Year, Old_CPU, Old_RAM, Old_RAM_Generation_ID,
            Old_Storage_Amount, Old_Storage_Type_ID, Old_Status,
            Old_Recipient_ID, Old_Donated_Date, Old_OS_ID)
        VALUES (OLD.ID, COALESCE(current_setting('app.current_username', true), current_user),
            'Delete', OLD.Manufacturer_ID, OLD.Model, OLD.Year,
            OLD.CPU, OLD.RAM, OLD.RAM_Generation_ID,
            OLD.Storage_Amount, OLD.Storage_Type_ID,
            OLD.Status, OLD.Recipient_ID,
            OLD.Donated_Date, OLD.OS_ID);
    END IF;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE TRIGGER Trg_Update_Device_Change_Log
    AFTER INSERT OR UPDATE OR DELETE ON Device
    FOR EACH ROW
    EXECUTE FUNCTION Update_Device_Change_Log();