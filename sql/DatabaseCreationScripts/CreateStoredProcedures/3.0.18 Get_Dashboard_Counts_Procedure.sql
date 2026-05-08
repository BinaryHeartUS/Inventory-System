DROP PROCEDURE IF EXISTS Get_Dashboard_Counts;

CREATE OR REPLACE PROCEDURE Get_Dashboard_Counts(
    IN  p_chapter_ids INTEGER[],
    OUT p_not_started INTEGER,
    OUT p_in_progress INTEGER,
    OUT p_ready_to_donate INTEGER,
    OUT p_donated INTEGER,
    OUT p_desktop_active INTEGER,
    OUT p_laptop_active INTEGER,
    OUT p_tablet_active INTEGER,
    OUT p_total_active INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
        COUNT(*) FILTER (WHERE d.status = 'Not Started')::INTEGER,
        COUNT(*) FILTER (WHERE d.status = 'In Progress')::INTEGER,
        COUNT(*) FILTER (WHERE d.status = 'Ready To Donate')::INTEGER,
        COUNT(*) FILTER (WHERE d.status = 'Donated')::INTEGER,
        COUNT(*) FILTER (WHERE d.status NOT IN ('Donated', 'Ready To Donate') AND dk.ID IS NOT NULL)::INTEGER,
        COUNT(*) FILTER (WHERE d.status NOT IN ('Donated', 'Ready To Donate') AND lp.ID IS NOT NULL)::INTEGER,
        COUNT(*) FILTER (WHERE d.status NOT IN ('Donated', 'Ready To Donate') AND tb.ID IS NOT NULL)::INTEGER,
        COUNT(*) FILTER (WHERE d.status NOT IN ('Donated', 'Ready To Donate'))::INTEGER
    INTO
        p_not_started,
        p_in_progress,
        p_ready_to_donate,
        p_donated,
        p_desktop_active,
        p_laptop_active,
        p_tablet_active,
        p_total_active
    FROM Device d
    JOIN Asset a ON d.ID = a.ID
    LEFT JOIN Desktop dk ON d.ID = dk.ID
    LEFT JOIN Laptop   lp ON d.ID = lp.ID
    LEFT JOIN Tablet   tb ON d.ID = tb.ID
    WHERE (p_chapter_ids IS NULL OR a.chapter_id = ANY(p_chapter_ids));
END;
$$;
