ALTER TABLE Note
    ALTER COLUMN Date TYPE TIMESTAMPTZ
    USING Date::timestamp AT TIME ZONE 'America/New_York';