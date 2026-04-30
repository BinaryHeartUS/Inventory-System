CREATE OR REPLACE FUNCTION Set_Asset_Acquired_Date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.Acquisition_Date IS NULL THEN
        NEW.Acquisition_Date := CURRENT_DATE;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER Trg_Set_Asset_Acquired_Date
    BEFORE INSERT ON Asset
    FOR EACH ROW
    EXECUTE FUNCTION Set_Asset_Acquired_Date();