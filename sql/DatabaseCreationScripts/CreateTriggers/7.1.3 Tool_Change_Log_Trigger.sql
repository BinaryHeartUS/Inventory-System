CREATE OR REPLACE FUNCTION Update_Tool_Change_Log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO Tool_Change_Log(Tool_ID, Modified_By, Change_Type,
            New_Description)
        VALUES (NEW.ID, COALESCE(current_setting('app.current_username', true), current_user),
            'Insert', NEW.Description);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.Description IS DISTINCT FROM NEW.Description THEN
            INSERT INTO Tool_Change_Log(Tool_ID, Modified_By, Change_Type,
                Old_Description, New_Description)
            VALUES (
                NEW.ID,
                COALESCE(current_setting('app.current_username', true), current_user),
                'Update',
                CASE WHEN OLD.Description IS DISTINCT FROM NEW.Description THEN OLD.Description END,
                CASE WHEN OLD.Description IS DISTINCT FROM NEW.Description THEN NEW.Description END
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO Part_Change_Log(Part_ID, Modified_By, Change_Type,
            Old_Description)
        VALUES (OLD.ID, COALESCE(current_setting('app.current_username', true), current_user),
            'Delete', OLD.Description);
    END IF;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE TRIGGER Trg_Update_Tool_Change_Log
    AFTER INSERT OR UPDATE OR DELETE ON Tool
    FOR EACH ROW
    EXECUTE FUNCTION Update_Tool_Change_Log();