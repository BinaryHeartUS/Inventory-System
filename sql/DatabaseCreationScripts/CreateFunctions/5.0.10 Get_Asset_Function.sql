DROP FUNCTION IF EXISTS Get_Asset;

CREATE OR REPLACE FUNCTION Get_Asset (
	p_assetID INTEGER
)
RETURNS TABLE (
    ID INTEGER,
    Acquisition_Date DATE NULL,
    Value MONEY NOT NULL,
    Chapter_ID INTEGER NOT NULL,
    Donor_ID INTEGER NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT *
    FROM Asset
    WHERE ID = p_assetID;
END;
$$;
