DROP PROCEDURE IF EXISTS Get_Donated_Total_Count;

CREATE OR REPLACE PROCEDURE Get_Donated_Total_Count(
    OUT p_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT COUNT(*) INTO p_count 
    FROM Device
    WHERE Device.status = 'Donated';
END;
$$;