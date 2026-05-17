DROP FUNCTION IF EXISTS Get_Part_Changelog_By_ID;

CREATE OR REPLACE FUNCTION Get_Part_Changelog_By_ID (
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
    Old_type VARCHAR(50),
    New_Type VARCHAR(50),
    Old_Description VARCHAR(500),
    New_Description VARCHAR(500),
    Old_Was_Purchased BOOLEAN,
    New_Was_Purchased BOOLEAN,
    Old_Contained_In INTEGER,
    New_Contained_In INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        partLog.Part_ID,
        partLog.Modified_By,
        partLog.Modified_At,
        partLog.Change_Type,
        assetLog.Old_Acquisition_Date,
        assetLog.New_Acquisition_Date,
        assetLog.Old_Value,
        assetLog.New_Value,
        assetLog.Old_Chapter_ID,
        assetLog.New_Chapter_ID,
        assetLog.Old_Donor_ID,
        assetLog.New_Donor_ID,
        oldType.Name as Old_Type,
        newType.Name as New_Type,
        partLog.Old_Description,
        partLog.New_Description,
        partLog.Old_Was_Purchased,
        partLog.New_Was_Purchased,
        partLog.Old_Contained_In,
        partLog.New_Contained_In
    FROM Part_Change_Log partLog
    LEFT JOIN Asset_Change_Log assetLog ON partLog.transaction_id = assetLog.transaction_id
    LEFT JOIN Part_Type oldType ON partLog.Old_Type_ID = oldType.ID
    LEFT JOIN Part_Type newType ON partLog.New_Type_ID = newType.ID
    WHERE partLog.Part_ID = p_assetID;
END;
$$;
