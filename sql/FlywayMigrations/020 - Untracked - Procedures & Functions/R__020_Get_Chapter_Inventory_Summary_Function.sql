DROP FUNCTION IF EXISTS Get_Chapter_Inventory_Summary;

CREATE OR REPLACE FUNCTION Get_Chapter_Inventory_Summary(
    p_chapter_ids INTEGER[] DEFAULT NULL
)
RETURNS TABLE (
    chapter_id INTEGER,
    chapter_name Name_Type,
    desktop_count INTEGER,
    laptop_count INTEGER,
    tablet_count INTEGER,
    not_started INTEGER,
    in_progress INTEGER,
    ready_to_donate INTEGER,
    donated INTEGER,
    scrapped INTEGER,
    total_devices INTEGER,
    parts_count INTEGER,
    tools_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS chapter_id,
        c.name AS chapter_name,
        COALESCE(dev.desktop, 0)::INTEGER,
        COALESCE(dev.laptop, 0)::INTEGER,
        COALESCE(dev.tablet, 0)::INTEGER,
        COALESCE(dev.not_started, 0)::INTEGER,
        COALESCE(dev.in_progress, 0)::INTEGER,
        COALESCE(dev.ready_to_donate, 0)::INTEGER,
        COALESCE(dev.donated, 0)::INTEGER,
        COALESCE(dev.scrapped, 0)::INTEGER,
        COALESCE(dev.total_devices, 0)::INTEGER,
        COALESCE(prt.parts, 0)::INTEGER,
        COALESCE(tl.tools, 0)::INTEGER
    FROM Chapter c
    LEFT JOIN (
        SELECT a.chapter_id,
            COUNT(*) FILTER (WHERE Get_Device_Type(d.ID) = 'Desktop') AS desktop,
            COUNT(*) FILTER (WHERE Get_Device_Type(d.ID) = 'Laptop') AS laptop,
            COUNT(*) FILTER (WHERE Get_Device_Type(d.ID) = 'Tablet') AS tablet,
            COUNT(*) FILTER (WHERE d.status = 'Not Started') AS not_started,
            COUNT(*) FILTER (WHERE d.status = 'In Progress') AS in_progress,
            COUNT(*) FILTER (WHERE d.status = 'Ready To Donate') AS ready_to_donate,
            COUNT(*) FILTER (WHERE d.status = 'Donated') AS donated,
            COUNT(*) FILTER (WHERE d.status = 'Scrapped') AS scrapped,
            COUNT(*) AS total_devices
        FROM Asset a
        JOIN Device d ON d.ID = a.ID
        GROUP BY a.chapter_id
    ) dev ON dev.chapter_id = c.id
    LEFT JOIN (
        SELECT a.chapter_id, COUNT(*) AS parts
        FROM Asset a JOIN Part p ON p.ID = a.ID
        GROUP BY a.chapter_id
    ) prt ON prt.chapter_id = c.id
    LEFT JOIN (
        SELECT a.chapter_id, COUNT(*) AS tools
        FROM Asset a JOIN Tool t ON t.ID = a.ID
        GROUP BY a.chapter_id
    ) tl ON tl.chapter_id = c.id
    WHERE (p_chapter_ids IS NULL OR c.id = ANY(p_chapter_ids))
    ORDER BY c.name;
END;
$$;
