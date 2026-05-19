CREATE OR REPLACE FUNCTION Update_Laptop_Change_Log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO Laptop_Change_Log(Laptop_ID, Modified_By, Change_Type,
            New_Design_Battery_Capacity, New_Actual_Battery_Capacity, New_Includes_Charger)
        VALUES (NEW.ID, COALESCE(current_setting('app.current_username', true), current_user),
            'Insert',
            NEW.Design_Battery_Capacity,
            NEW.Actual_Battery_Capacity,
            NEW.Includes_Charger
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.Design_Battery_Capacity IS DISTINCT FROM NEW.Design_Battery_Capacity OR
            OLD.Actual_Battery_Capacity IS DISTINCT FROM NEW.Actual_Battery_Capacity OR
            OLD.Includes_Charger IS DISTINCT FROM NEW.Includes_Charger THEN
            INSERT INTO Laptop_Change_Log(Laptop_ID, Modified_By, Change_Type,
                Old_Design_Battery_Capacity, New_Design_Battery_Capacity,
                Old_Actual_Battery_Capacity, New_Actual_Battery_Capacity,
                Old_Includes_Charger, New_Includes_Charger)
            VALUES (NEW.ID, COALESCE(current_setting('app.current_username', true), current_user),
                'Update',
                CASE WHEN OLD.Design_Battery_Capacity IS DISTINCT FROM NEW.Design_Battery_Capacity THEN OLD.Design_Battery_Capacity END,
                CASE WHEN OLD.Design_Battery_Capacity IS DISTINCT FROM NEW.Design_Battery_Capacity THEN NEW.Design_Battery_Capacity END,
                CASE WHEN OLD.Actual_Battery_Capacity IS DISTINCT FROM NEW.Actual_Battery_Capacity THEN OLD.Actual_Battery_Capacity END,
                CASE WHEN OLD.Actual_Battery_Capacity IS DISTINCT FROM NEW.Actual_Battery_Capacity THEN NEW.Actual_Battery_Capacity END,
                CASE WHEN OLD.Includes_Charger IS DISTINCT FROM NEW.Includes_Charger THEN OLD.Includes_Charger END,
                CASE WHEN OLD.Includes_Charger IS DISTINCT FROM NEW.Includes_Charger THEN NEW.Includes_Charger END);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO Laptop_Change_Log(Laptop_ID, Modified_By, Change_Type, Old_Design_Battery_Capacity,
            Old_Actual_Battery_Capacity, Old_Includes_Charger)
        VALUES (OLD.ID, COALESCE(current_setting('app.current_username', true), current),
            'Delete', OLD.Design_Battery_Capacity, OLD.Actual_Battery_Capacity, OLD.Includes_Charger);
    END IF;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE TRIGGER Trg_Update_Laptop_Change_Log
    AFTER INSERT OR UPDATE OR DELETE ON Laptop
    FOR EACH ROW
    EXECUTE FUNCTION Update_Laptop_Change_Log();