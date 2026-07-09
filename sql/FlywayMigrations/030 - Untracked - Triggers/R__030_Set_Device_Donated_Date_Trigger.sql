DROP TRIGGER IF EXISTS Trg_Set_Device_Donated_Date ON Device;
DROP FUNCTION IF EXISTS Set_Device_Donated_Date();

CREATE FUNCTION Set_Device_Donated_Date()
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

CREATE TRIGGER Trg_Set_Device_Donated_Date
    BEFORE INSERT OR UPDATE ON Device
    FOR EACH ROW
    EXECUTE FUNCTION Set_Device_Donated_Date();