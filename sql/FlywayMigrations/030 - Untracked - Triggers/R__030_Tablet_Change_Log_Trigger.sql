DROP TRIGGER IF EXISTS Trg_Update_Tablet_Change_Log ON Tablet;
DROP FUNCTION IF EXISTS Update_Tablet_Change_Log();

CREATE FUNCTION Update_Tablet_Change_Log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO Tablet_Change_Log(Tablet_ID, Modified_By, Change_Type,
            New_Includes_Charger, New_Working_Battery)
        VALUES (NEW.ID, COALESCE(current_setting('app.current_username', true), current_user),
            'Insert',
            NEW.Includes_Charger,
            NEW.Working_Battery
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.Design_Battery_Capacity IS DISTINCT FROM NEW.Design_Battery_Capacity OR
            OLD.Actual_Battery_Capacity IS DISTINCT FROM NEW.Actual_Battery_Capacity OR
            OLD.Includes_Charger IS DISTINCT FROM NEW.Includes_Charger THEN
            INSERT INTO Laptop_Change_Log(Laptop_ID, Modified_By, Change_Type,
                Old_Includes_Charger, New_Includes_Charger,
                Old_Working_Battery, New_Working_Battery)
            VALUES (NEW.ID, COALESCE(current_setting('app.current_username', true), current_user),
                'Update',
                CASE WHEN OLD.Includes_Charger IS DISTINCT FROM NEW.Includes_Charger THEN OLD.Includes_Charger END,
                CASE WHEN OLD.Includes_Charger IS DISTINCT FROM NEW.Includes_Charger THEN NEW.Includes_Charger END,
                CASE WHEN OLD.Working_Battery IS DISTINCT FROM NEW.Working_Battery THEN OLD.Includes_Charger END,
                CASE WHEN OLD.Working_Battery IS DISTINCT FROM NEW.Working_Battery THEN NEW.Working_Battery END);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO Tablet_Change_Log(Tablet_ID, Modified_By, Change_Type, Old_Includes_Charger, Old_Working_Battery)
        VALUES (OLD.ID, COALESCE(current_setting('app.current_username', true), current),
            'Delete', OLD.Includes_Charger, OLD.Working_Battery);
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER Trg_Update_Tablet_Change_Log
    AFTER INSERT OR UPDATE OR DELETE ON Tablet
    FOR EACH ROW
    EXECUTE FUNCTION Update_Tablet_Change_Log();