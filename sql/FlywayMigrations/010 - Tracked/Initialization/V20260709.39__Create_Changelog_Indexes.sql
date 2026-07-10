CREATE INDEX IF NOT EXISTS idx_part_changelog_part_id
    ON Part_Change_Log(Part_ID);

CREATE INDEX IF NOT EXISTS idx_tool_changelog_tool_id
    ON Tool_Change_Log(Tool_ID);

CREATE INDEX IF NOT EXISTS idx_device_changelog_device_id
    ON Device_Change_Log(Device_ID);

CREATE INDEX IF NOT EXISTS idx_asset_changelog_asset_id
    ON Asset_Change_Log(Asset_ID);
