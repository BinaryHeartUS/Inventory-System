DROP PROCEDURE IF EXISTS Get_Device_Total_Count;

CREATE OR REPLACE PROCEDURE Get_Device_Total_Count(
    OUT p_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT COUNT(*) INTO p_count 
    FROM Device
    WHERE Device.status NOT IN ('Donated', 'ReadyToDonate');
END;
$$;