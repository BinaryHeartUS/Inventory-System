DROP FUNCTION IF EXISTS Get_Misc_Changelog_By_ID;

CREATE OR REPLACE FUNCTION Get_Misc_Changelog_By_ID(
    p_Asset_ID INTEGER
)
RETURNS TABLE (
    id INTEGER,
    modified_by Name_Type,
    modified_at TIMESTAMPTZ,
    change_type Change_Type,
    old_acquisition_date DATE,
    new_acquisition_date DATE,
    old_value MONEY,
    new_value MONEY,
    old_donor_id INTEGER,
    new_donor_id INTEGER,
    old_description VARCHAR(500),
    new_description VARCHAR(500)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(misc_log.Misc_ID, asset_log.Asset_ID),
        COALESCE(misc_log.Modified_By, asset_log.Modified_By),
        COALESCE(misc_log.Modified_At, asset_log.Modified_At),
        COALESCE(misc_log.Change_Type, asset_log.Change_Type),
        asset_log.Old_Acquisition_Date,
        asset_log.New_Acquisition_Date,
        asset_log.Old_Value,
        asset_log.New_Value,
        asset_log.Old_Donor_ID,
        asset_log.New_Donor_ID,
        misc_log.Old_Description,
        misc_log.New_Description
    FROM Asset_Change_Log asset_log
    FULL JOIN Misc_Change_Log misc_log ON misc_log.Transaction_ID = asset_log.Transaction_ID
    WHERE misc_log.Misc_ID = p_Asset_ID OR asset_log.Asset_ID = p_Asset_ID;
END;
$$;