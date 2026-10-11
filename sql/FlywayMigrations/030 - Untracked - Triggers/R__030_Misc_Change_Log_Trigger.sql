DROP TRIGGER IF EXISTS Trg_Update_Misc_Change_Log ON Misc;
DROP FUNCTION IF EXISTS Update_Misc_Change_Log();

CREATE FUNCTION Update_Misc_Change_Log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO Misc_Change_Log(Misc_ID, Modified_By, Change_Type, New_Description)
        VALUES (NEW.ID, COALESCE(current_setting('app.current_username', true), current_user),
            'Insert', NEW.Description);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.Description IS DISTINCT FROM NEW.Description THEN
            INSERT INTO Misc_Change_Log(Misc_ID, Modified_By, Change_Type,
                Old_Description, New_Description)
            VALUES (NEW.ID, COALESCE(current_setting('app.current_username', true), current_user),
                'Update', OLD.Description, NEW.Description);
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO Misc_Change_Log(Misc_ID, Modified_By, Change_Type, Old_Description)
        VALUES (OLD.ID, COALESCE(current_setting('app.current_username', true), current_user),
            'Delete', OLD.Description);
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER Trg_Update_Misc_Change_Log
    AFTER INSERT OR UPDATE OR DELETE ON Misc
    FOR EACH ROW
    EXECUTE FUNCTION Update_Misc_Change_Log();