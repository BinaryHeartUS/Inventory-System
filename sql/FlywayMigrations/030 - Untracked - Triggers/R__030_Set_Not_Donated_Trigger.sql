DROP TRIGGER IF EXISTS Trg_Set_Not_Donated ON Device;
DROP FUNCTION IF EXISTS Set_Not_Donated();

CREATE FUNCTION Set_Not_Donated()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.Status <> 'Donated' AND OLD.Status = 'Donated' THEN
        NEW.Donated_Date = NULL;
        NEW.Recipient_ID = NULL;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER Trg_Set_Not_Donated
    BEFORE UPDATE ON Device
    FOR EACH ROW
    EXECUTE FUNCTION Set_Not_Donated();