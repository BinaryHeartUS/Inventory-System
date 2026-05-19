DROP FUNCTION IF EXISTS Get_Device_Type;

CREATE OR REPLACE FUNCTION Get_Device_Type (
	p_deviceID INTEGER
)
RETURNS VARCHAR(10)
LANGUAGE plpgsql
AS $$
BEGIN
	IF ((SELECT COUNT(*)
		FROM Desktop d
		WHERE d.ID = p_deviceID) > 0) THEN
		RETURN 'Desktop';
	END IF;

	IF ((SELECT COUNT(*)
		FROM Laptop l
		WHERE l.ID = p_deviceID) > 0) THEN
		RETURN 'Laptop';
	END IF;

	IF ((SELECT COUNT(*)
		FROM Tablet t
		WHERE t.ID = p_deviceID) > 0) THEN
		RETURN 'Tablet';
	END IF;

	RETURN 'Unknown';
END;
$$;
