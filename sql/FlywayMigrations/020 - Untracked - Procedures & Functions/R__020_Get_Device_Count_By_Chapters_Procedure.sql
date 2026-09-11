DROP PROCEDURE IF EXISTS Get_Device_Count_By_Chapters;

CREATE OR REPLACE PROCEDURE Get_Device_Count_By_Chapters(
    IN  p_type VARCHAR(10),
    IN  p_status TEXT,
    IN  p_chapter_ids INTEGER[],
    OUT p_count       INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT COUNT(*)::INTEGER INTO p_count
    FROM Device d
    JOIN Asset a ON d.ID = a.ID
    LEFT JOIN Desktop dk ON d.ID = dk.ID
    LEFT JOIN Laptop   lp ON d.ID = lp.ID
    LEFT JOIN Tablet   tb ON d.ID = tb.ID
    WHERE (
        p_type = 'total'
        OR (p_type = 'desktop' AND dk.ID IS NOT NULL)
        OR (p_type = 'laptop' AND lp.ID IS NOT NULL)
        OR (p_type = 'tablet' AND tb.ID IS NOT NULL)
    )
    AND (
        (p_status = 'active' AND d.status NOT IN ('Donated', 'Ready To Donate'))
        OR (p_status = 'not-started' AND d.status = 'Not Started')
        OR (p_status = 'in-progress' AND d.status = 'In Progress')
        OR (p_status = 'ready-to-donate' AND d.status = 'Ready To Donate')
        OR (p_status = 'donated' AND d.status = 'Donated')
    )
    AND (p_chapter_ids IS NULL OR a.chapter_id = ANY(p_chapter_ids));
END;
$$;
