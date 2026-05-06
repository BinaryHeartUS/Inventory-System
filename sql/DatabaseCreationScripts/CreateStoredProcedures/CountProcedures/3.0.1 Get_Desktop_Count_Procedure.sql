DROP PROCEDURE IF EXISTS Get_Desktop_Count;

CREATE OR REPLACE PROCEDURE Get_Desktop_Count(
    OUT p_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT COUNT(*) INTO p_count 
    FROM Desktop
    JOIN Device ON Desktop.ID = Device.ID
    WHERE Device.status NOT IN ('Donated', 'Ready To Donate');
END;
$$;