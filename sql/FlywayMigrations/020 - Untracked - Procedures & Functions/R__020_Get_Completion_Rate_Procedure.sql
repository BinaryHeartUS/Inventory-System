DROP PROCEDURE IF EXISTS Get_Completion_Rate;

CREATE OR REPLACE PROCEDURE Get_Completion_Rate(
    IN  p_chapter_ids INTEGER[],
    OUT p_donated INTEGER,
    OUT p_total INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
        COUNT(*) FILTER (WHERE d.status = 'Donated')::INTEGER,
        COUNT(*) FILTER (WHERE d.status NOT IN ('Scrapped', 'Unknown'))::INTEGER
    INTO p_donated, p_total
    FROM Device d
    JOIN Asset a ON d.ID = a.ID
    WHERE (p_chapter_ids IS NULL OR a.chapter_id = ANY(p_chapter_ids));
END;
$$;
