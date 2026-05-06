DROP FUNCTION IF EXISTS Get_Device_Type;

CREATE OR REPLACE FUNCTION Get_Device_Type (
	p_desktopID INTEGER,
	p_laptopID INTEGER,
	p_tabletID INTEGER
)
RETURNS VARCHAR(10)
LANGUAGE plpgsql
AS $$
BEGIN
	IF p_desktopID IS NOT NULL THEN
		RETURN 'Desktop';
	END IF;

	IF p_laptopID IS NOT NULL THEN
		RETURN 'Laptop';
	END IF;

	IF p_tabletID IS NOT NULL THEN
		RETURN 'Tablet';
	END IF;

	RETURN 'Unknown';
END;
$$;
