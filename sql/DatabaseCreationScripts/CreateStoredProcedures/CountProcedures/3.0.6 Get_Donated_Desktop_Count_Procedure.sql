DROP PROCEDURE IF EXISTS Get_Donated_Desktop_Count;

CREATE OR REPLACE PROCEDURE Get_Donated_Desktop_Count(
    OUT p_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT COUNT(*) INTO p_count 
    FROM Desktop d
    JOIN Device ON d.ID = Device.ID
    WHERE Device.status = 'Donated';
END;
$$;