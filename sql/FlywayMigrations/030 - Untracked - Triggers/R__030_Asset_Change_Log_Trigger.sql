DROP TRIGGER IF EXISTS Trg_Update_Asset_Change_Log ON Asset;
DROP FUNCTION IF EXISTS Update_Asset_Change_Log();

CREATE FUNCTION Update_Asset_Change_Log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO Asset_Change_Log(Asset_ID, Modified_By, Change_Type,
            New_Acquisition_Date, New_Value, New_Chapter_ID, New_Donor_ID)
        VALUES (NEW.ID, COALESCE(current_setting('app.current_username', true), current_user),
            'Insert', NEW.Acquisition_Date, NEW.Value, NEW.Chapter_ID, NEW.Donor_ID);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.Acquisition_Date IS DISTINCT FROM NEW.Acquisition_Date OR
           OLD.Value IS DISTINCT FROM NEW.Value OR
           OLD.Chapter_ID IS DISTINCT FROM NEW.Chapter_ID OR
           OLD.Donor_ID IS DISTINCT FROM NEW.Donor_ID THEN
            INSERT INTO Asset_Change_Log(Asset_ID, Modified_By, Change_Type,
                Old_Acquisition_Date, New_Acquisition_Date,
                Old_Value, New_Value,
                Old_Chapter_ID, New_Chapter_ID,
                Old_Donor_ID, New_Donor_ID)
            VALUES (
                NEW.ID,
                COALESCE(current_setting('app.current_username', true), current_user),
                'Update',
                CASE WHEN OLD.Acquisition_Date IS DISTINCT FROM NEW.Acquisition_Date THEN OLD.Acquisition_Date END,
                CASE WHEN OLD.Acquisition_Date IS DISTINCT FROM NEW.Acquisition_Date THEN NEW.Acquisition_Date END,
                CASE WHEN OLD.Value IS DISTINCT FROM NEW.Value THEN OLD.Value END,
                CASE WHEN OLD.Value IS DISTINCT FROM NEW.Value THEN NEW.Value END,
                CASE WHEN OLD.Chapter_ID IS DISTINCT FROM NEW.Chapter_ID THEN OLD.Chapter_ID END,
                CASE WHEN OLD.Chapter_ID IS DISTINCT FROM NEW.Chapter_ID THEN NEW.Chapter_ID END,
                CASE WHEN OLD.Donor_ID IS DISTINCT FROM NEW.Donor_ID THEN OLD.Donor_ID END,
                CASE WHEN OLD.Donor_ID IS DISTINCT FROM NEW.Donor_ID THEN NEW.Donor_ID END
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO Asset_Change_Log(Asset_ID, Modified_By, Change_Type,
            Old_Acquisition_Date, Old_Value, Old_Chapter_ID, Old_Donor_ID)
        VALUES (OLD.ID, COALESCE(current_setting('app.current_username', true), current_user),
            'Delete', OLD.Acquisition_Date, OLD.Value, OLD.Chapter_ID, OLD.Donor_ID);
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER Trg_Update_Asset_Change_Log
    AFTER INSERT OR UPDATE OR DELETE ON Asset
    FOR EACH ROW
    EXECUTE FUNCTION Update_Asset_Change_Log();