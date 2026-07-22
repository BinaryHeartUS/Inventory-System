DROP FUNCTION IF EXISTS Get_Devices_Page;

-- Paginated / filtered / sorted device listing.
-- All list-page filtering and sorting lives here (never built as SQL strings in Java).
-- p_chapter_ids: NULL = all chapters (national); otherwise restricts to the given chapter IDs.
-- p_limit: NULL = no limit (used for export / "fetch all matching" callers).
CREATE OR REPLACE FUNCTION Get_Devices_Page(
    p_chapter_ids INTEGER[] DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_type TEXT DEFAULT NULL,
    p_status STATUS DEFAULT NULL,
    p_include_donated BOOLEAN DEFAULT TRUE,
    p_include_scrapped BOOLEAN DEFAULT TRUE,
    p_donor_id INTEGER DEFAULT NULL,
    p_recipient_id INTEGER DEFAULT NULL,
    p_sort TEXT DEFAULT 'id',
    p_dir TEXT DEFAULT 'asc',
    p_limit INTEGER DEFAULT NULL,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    type VARCHAR(10),
    ID INTEGER,
    acquisition_date DATE,
    value NUMERIC,
    manufacturer VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    CPU VARCHAR(50),
    RAM INTEGER,
    RAM_generation VARCHAR(20),
    storage_amount INTEGER,
    storage_type VARCHAR(30),
    status STATUS,
    has_wifi BOOLEAN,
    includes_charger CHARGER_STATUS,
    design_capacity INTEGER,
    actual_capacity INTEGER,
    battery_health NUMERIC,
    working_battery WORKING_BATTERY,
    chapter Name_Type,
    donated_date DATE,
    operating_system VARCHAR(50),
    donor_id INTEGER,
    recipient_id INTEGER,
    chapter_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT gd.*
    FROM Get_Devices gd
    -- Compute a single text sort key once (via LATERAL). Numeric columns are zero-padded and
    -- dates ISO-formatted so one text key orders every column type correctly; direction is
    -- then applied with just two ORDER BY expressions below.
    CROSS JOIN LATERAL (
      SELECT 
        CASE p_sort
          WHEN 'type' THEN lower(gd.type)
          WHEN 'manufacturer' THEN lower(gd.manufacturer)
          WHEN 'model' THEN lower(gd.model)
          WHEN 'cpu' THEN lower(gd.CPU)
          WHEN 'operatingSystem' THEN lower(gd.operating_system)
          WHEN 'chapter' THEN lower(gd.chapter::text)
          WHEN 'status' THEN CASE gd.status
              WHEN 'Not Started' THEN '0' WHEN 'In Progress' THEN '1'
              WHEN 'Ready To Donate' THEN '2' WHEN 'Donated' THEN '3'
              WHEN 'Scrapped' THEN '4' ELSE '5' END
          WHEN 'year' THEN lpad(gd.year::text, 12, '0')
          WHEN 'ram' THEN lpad(gd.RAM::text, 12, '0')
          WHEN 'storage' THEN lpad(gd.storage_amount::text, 12, '0')
          WHEN 'acquisitionDate' THEN to_char(gd.acquisition_date, 'YYYY-MM-DD')
          ELSE lpad(gd.ID::text, 12, '0')
        END 
        AS sort_key
    ) AS k
    WHERE (p_chapter_ids IS NULL OR gd.chapter_id = ANY(p_chapter_ids))
      AND (p_type IS NULL OR gd.type = p_type)
      AND (p_status IS NULL OR gd.status = p_status)
      AND (p_include_donated OR gd.status <> 'Donated')
      AND (p_include_scrapped OR gd.status <> 'Scrapped')
      AND (p_donor_id IS NULL OR gd.donor_id = p_donor_id)
      AND (p_recipient_id IS NULL OR gd.recipient_id = p_recipient_id)
      AND (p_search IS NULL OR p_search = '' OR gd::text ILIKE '%' || p_search || '%')
    ORDER BY
      CASE WHEN p_dir <> 'desc' THEN k.sort_key END ASC NULLS LAST,
      CASE WHEN p_dir = 'desc' THEN k.sort_key END DESC NULLS LAST,
      gd.ID
    LIMIT p_limit OFFSET COALESCE(p_offset, 0);
END;
$$;
