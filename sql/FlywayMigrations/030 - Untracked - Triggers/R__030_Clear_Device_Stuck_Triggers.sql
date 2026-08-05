DROP TRIGGER IF EXISTS Trg_Clear_Device_Stuck_From_Asset_Log ON Asset_Change_Log;
DROP TRIGGER IF EXISTS Trg_Clear_Device_Stuck_From_Device_Log ON Device_Change_Log;
DROP TRIGGER IF EXISTS Trg_Clear_Device_Stuck_From_Desktop_Log ON Desktop_Change_Log;
DROP TRIGGER IF EXISTS Trg_Clear_Device_Stuck_From_Laptop_Log ON Laptop_Change_Log;
DROP TRIGGER IF EXISTS Trg_Clear_Device_Stuck_From_Tablet_Log ON Tablet_Change_Log;
DROP TRIGGER IF EXISTS Trg_Track_Note_Activity ON Note;
DROP FUNCTION IF EXISTS Clear_Device_Stuck_From_Change_Log();
DROP FUNCTION IF EXISTS Track_Note_Activity();

CREATE FUNCTION Clear_Device_Stuck_From_Change_Log()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_Device_ID INTEGER;
BEGIN
    v_Device_ID := (to_jsonb(NEW) ->> TG_ARGV[0])::INTEGER;

    UPDATE Device
    SET Device_Stuck = FALSE
    WHERE ID = v_Device_ID
      AND Device_Stuck;

    RETURN NEW;
END;
$$;

CREATE TRIGGER Trg_Clear_Device_Stuck_From_Asset_Log
    AFTER INSERT ON Asset_Change_Log
    FOR EACH ROW EXECUTE FUNCTION Clear_Device_Stuck_From_Change_Log('asset_id');

CREATE TRIGGER Trg_Clear_Device_Stuck_From_Device_Log
    AFTER INSERT ON Device_Change_Log
    FOR EACH ROW EXECUTE FUNCTION Clear_Device_Stuck_From_Change_Log('device_id');

CREATE TRIGGER Trg_Clear_Device_Stuck_From_Desktop_Log
    AFTER INSERT ON Desktop_Change_Log
    FOR EACH ROW EXECUTE FUNCTION Clear_Device_Stuck_From_Change_Log('desktop_id');

CREATE TRIGGER Trg_Clear_Device_Stuck_From_Laptop_Log
    AFTER INSERT ON Laptop_Change_Log
    FOR EACH ROW EXECUTE FUNCTION Clear_Device_Stuck_From_Change_Log('laptop_id');

CREATE TRIGGER Trg_Clear_Device_Stuck_From_Tablet_Log
    AFTER INSERT ON Tablet_Change_Log
    FOR EACH ROW EXECUTE FUNCTION Clear_Device_Stuck_From_Change_Log('tablet_id');

CREATE FUNCTION Track_Note_Activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.Text IS NOT DISTINCT FROM NEW.Text THEN
        RETURN NEW;
    END IF;

    NEW.Modified_At := CURRENT_TIMESTAMP;

    UPDATE Device
    SET Device_Stuck = FALSE
    WHERE ID = NEW.Asset_ID
      AND Device_Stuck;

    RETURN NEW;
END;
$$;

CREATE TRIGGER Trg_Track_Note_Activity
    BEFORE INSERT OR UPDATE ON Note
    FOR EACH ROW EXECUTE FUNCTION Track_Note_Activity();