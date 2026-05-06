DROP PROCEDURE IF EXISTS Get_Laptop_Count;

CREATE OR REPLACE PROCEDURE Get_Laptop_Count(
    OUT p_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT COUNT(*) INTO p_count 
    FROM Laptop d
    JOIN Device ON d.ID = Device.ID
    WHERE Device.status NOT IN ('Donated', 'Ready To Donate');
END;
$$;