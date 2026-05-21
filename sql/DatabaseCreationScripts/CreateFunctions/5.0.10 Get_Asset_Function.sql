DROP FUNCTION IF EXISTS Get_Asset;

CREATE OR REPLACE FUNCTION Get_Asset (
	p_assetID INTEGER
)
RETURNS TABLE (
    ID INTEGER,
    Acquisition_Date DATE,
    Value MONEY,
    Chapter_ID INTEGER,
    Donor_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT *
    FROM Asset
    WHERE ID = p_assetID;
END;
$$;
