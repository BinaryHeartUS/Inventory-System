CREATE OR REPLACE FUNCTION Get_Device(
    p_ID INTEGER
)
RETURNS TABLE (
	type VARCHAR(10),
    ID INTEGER,
    acquisition_date DATE,
    value MONEY,
    manufacturer VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    CPU VARCHAR(50),
    RAM INTEGER,
    RAM_generation VARCHAR(20),
    storage_amount INTEGER,
    storage_type VARCHAR(30),
    status STATUS,
    has_wifi BOOLEAN,
    includes_charger CHARGER_STATUS,
    design_capacity INTEGER,
    actual_capacity INTEGER,
    battery_health numeric,
    working_battery WORKING_BATTERY
)
LANGUAGE plpgsql
AS $$
BEGIN
	RETURN QUERY
	SELECT *
	FROM Get_Devices gd
	WHERE gd.ID = p_ID;
END;
$$;