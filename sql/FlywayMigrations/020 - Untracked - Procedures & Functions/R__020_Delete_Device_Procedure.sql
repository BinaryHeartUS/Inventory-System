DROP PROCEDURE IF EXISTS Delete_Device;

CREATE OR REPLACE PROCEDURE Delete_Device(
    IN p_device_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Device WHERE ID = p_device_id) THEN
        RAISE SQLSTATE '02000'
        USING MESSAGE = 'No device found with matching asset ID';
    END IF;

    DELETE FROM Asset
    WHERE ID = p_device_id;
END;
$$;