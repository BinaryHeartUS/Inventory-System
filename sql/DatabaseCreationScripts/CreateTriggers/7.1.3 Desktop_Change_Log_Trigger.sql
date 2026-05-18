CREATE OR REPLACE FUNCTION Update_Desktop_Change_Log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO Desktop_Change_Log(Desktop_ID, Modified_By, Change_Type,
            New_HasWifi)
        VALUES (NEW.ID, COALESCE(current_setting('app.current_username', true), current_user),
            'Insert',
            NEW.HasWifi
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.HasWifi IS DISTINCT FROM NEW.HasWifi THEN
            INSERT INTO Desktop_Change_Log(Desktop_ID, Modified_By, Change_Type,
                Old_HasWifi, New_HasWifi)
            VALUES (NEW.ID, COALESCE(current_setting('app.current_username', true), current_user),
                'Update',
                CASE WHEN OLD.HasWifi IS DISTINCT FROM NEW.HasWifi THEN OLD.HasWifi END,
                CASE WHEN OLD.HasWifi IS DISTINCT FROM NEW.HasWifi THEN NEW.HasWifi END);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO Desktop_Change_Log(Desktop_ID, Modified_By, Change_Type, Old_HasWifi)
        VALUES (OLD.ID, COALESCE(current_setting('app.current_username', true), current),
            'Delete', OLD.HasWifi);
    END IF;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE TRIGGER Trg_Update_Desktop_Change_Log
    AFTER INSERT OR UPDATE OR DELETE ON Desktop
    FOR EACH ROW
    EXECUTE FUNCTION Update_Desktop_Change_Log();