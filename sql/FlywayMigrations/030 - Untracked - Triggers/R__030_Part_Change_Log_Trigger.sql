DROP TRIGGER IF EXISTS Trg_Update_Part_Change_Log ON Part;
DROP FUNCTION IF EXISTS Update_Part_Change_Log();

CREATE FUNCTION Update_Part_Change_Log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO Part_Change_Log(Part_ID, Modified_By, Change_Type,
            New_Type_ID, New_Description, New_Was_Purchased, New_Contained_In)
        VALUES (NEW.ID, COALESCE(current_setting('app.current_username', true), current_user),
            'Insert', NEW.Type_ID, NEW.Description, NEW.Was_Purchased, NEW.Contained_In);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.Type_ID IS DISTINCT FROM NEW.Type_ID OR
           OLD.Description IS DISTINCT FROM NEW.Description OR
           OLD.Was_Purchased IS DISTINCT FROM NEW.Was_Purchased OR
           OLD.Contained_In IS DISTINCT FROM NEW.Contained_In THEN
            INSERT INTO Part_Change_Log(Part_ID, Modified_By, Change_Type,
                Old_Type_ID, New_Type_ID,
                Old_Description, New_Description,
                Old_Was_Purchased, New_Was_Purchased,
                Old_Contained_In, New_Contained_In)
            VALUES (
                NEW.ID,
                COALESCE(current_setting('app.current_username', true), current_user),
                'Update',
                CASE WHEN OLD.Type_ID IS DISTINCT FROM NEW.Type_ID THEN OLD.Type_ID END,
                CASE WHEN OLD.Type_ID IS DISTINCT FROM NEW.Type_ID THEN NEW.Type_ID END,
                CASE WHEN OLD.Description IS DISTINCT FROM NEW.Description THEN OLD.Description END,
                CASE WHEN OLD.Description IS DISTINCT FROM NEW.Description THEN NEW.Description END,
                CASE WHEN OLD.Was_Purchased IS DISTINCT FROM NEW.Was_Purchased THEN OLD.Was_Purchased END,
                CASE WHEN OLD.Was_Purchased IS DISTINCT FROM NEW.Was_Purchased THEN NEW.Was_Purchased END,
                CASE WHEN OLD.Contained_In IS DISTINCT FROM NEW.Contained_In THEN OLD.Contained_In END,
                CASE WHEN OLD.Contained_In IS DISTINCT FROM NEW.Contained_In THEN NEW.Contained_In END
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO Part_Change_Log(Part_ID, Modified_By, Change_Type,
            Old_Type_ID, Old_Description, Old_Was_Purchased, Old_Contained_In)
        VALUES (OLD.ID, COALESCE(current_setting('app.current_username', true), current_user),
            'Delete', OLD.Type_ID, OLD.Description, OLD.Was_Purchased, OLD.Contained_In);
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER Trg_Update_Part_Change_Log
    AFTER INSERT OR UPDATE OR DELETE ON Part
    FOR EACH ROW
    EXECUTE FUNCTION Update_Part_Change_Log();