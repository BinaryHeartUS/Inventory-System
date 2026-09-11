DROP FUNCTION IF EXISTS Get_Tool_Changelog_By_ID;

CREATE OR REPLACE FUNCTION Get_Tool_Changelog_By_ID (
	p_assetID INTEGER
)
RETURNS TABLE (
    id INTEGER,
    Modified_By Name_Type,
    Modified_At TIMESTAMPTZ,
    Change_Type Change_Type,
    Old_Acquisition_Date DATE,
    New_Acquisition_Date DATE,
    Old_Value MONEY,
    New_Value MONEY,
    Old_Chapter_ID INTEGER,
    New_Chapter_ID INTEGER,
    Old_Donor_ID INTEGER,
    New_Donor_ID INTEGER,
    Old_Description VARCHAR(500),
    New_Description VARCHAR(500)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(toolLog.Tool_ID, assetLog.Asset_ID) AS id,
        COALESCE(toolLog.Modified_By, assetLog.Modified_By) AS Modified_By,
        COALESCE(toolLog.Modified_At, assetLog.Modified_At) AS Modified_At,
        COALESCE(toolLog.Change_Type, assetLog.Change_Type) AS Change_Type,
        assetLog.Old_Acquisition_Date,
        assetLog.New_Acquisition_Date,
        assetLog.Old_Value,
        assetLog.New_Value,
        assetLog.Old_Chapter_ID,
        assetLog.New_Chapter_ID,
        assetLog.Old_Donor_ID,
        assetLog.New_Donor_ID,
        toolLog.Old_Description,
        toolLog.New_Description
    FROM Asset_Change_Log assetLog
    FULL JOIN Tool_Change_Log toolLog ON toolLog.transaction_id = assetLog.transaction_id
    WHERE toolLog.Tool_ID = p_assetID OR assetLog.Asset_ID = p_assetID;
END;
$$;
