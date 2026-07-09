CREATE OR REPLACE FUNCTION Set_Device_Donated_Date()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.Status = 'Donated' AND NEW.Donated_Date IS NULL THEN
            NEW.Donated_Date = CURRENT_DATE;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.Status = 'Donated' AND (OLD.Status IS DISTINCT FROM 'Donated') AND NEW.Donated_Date IS NULL THEN
            NEW.Donated_Date = CURRENT_DATE;
        ELSIF NEW.Status <> 'Donated' AND OLD.Status = 'Donated' THEN
            NEW.Donated_Date = NULL;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER Trg_Set_Device_Donated_Date
    BEFORE INSERT OR UPDATE ON Device
    FOR EACH ROW
    EXECUTE FUNCTION Set_Device_Donated_Date();