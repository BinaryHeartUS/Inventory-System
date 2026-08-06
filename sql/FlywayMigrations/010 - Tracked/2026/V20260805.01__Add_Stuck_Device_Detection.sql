ALTER TABLE Device
    ADD COLUMN Device_Stuck BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE Note
    ADD COLUMN Modified_At TIMESTAMPTZ;

UPDATE Note
SET Modified_At = Date;

ALTER TABLE Note
    ALTER COLUMN Modified_At SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN Modified_At SET NOT NULL;

CREATE INDEX idx_desktop_changelog_desktop_id_modified_at
    ON Desktop_Change_Log(Desktop_ID, Modified_At DESC);

CREATE INDEX idx_laptop_changelog_laptop_id_modified_at
    ON Laptop_Change_Log(Laptop_ID, Modified_At DESC);

CREATE INDEX idx_tablet_changelog_tablet_id_modified_at
    ON Tablet_Change_Log(Tablet_ID, Modified_At DESC);

CREATE INDEX idx_note_asset_id_modified_at
    ON Note(Asset_ID, Modified_At DESC);

CREATE INDEX idx_device_stuck
    ON Device(Device_Stuck)
    WHERE Device_Stuck;