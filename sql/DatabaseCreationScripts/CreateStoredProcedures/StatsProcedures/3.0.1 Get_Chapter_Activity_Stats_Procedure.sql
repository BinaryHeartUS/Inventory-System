DROP PROCEDURE IF EXISTS Get_Chapter_Activity_Stats;

CREATE OR REPLACE PROCEDURE Get_Chapter_Activity_Stats(
    IN  p_chapter_ids INTEGER[],
    OUT p_total_chapters INTEGER,
    OUT p_active_chapters INTEGER,
    OUT p_chapters_with_ready INTEGER,
    OUT p_chapters_working INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT
        COUNT(DISTINCT c.id)::INTEGER,
        COUNT(DISTINCT c.id) FILTER (
            WHERE EXISTS (
                SELECT 1 FROM Asset a2
                JOIN Device d2 ON d2.id = a2.id
                WHERE a2.chapter_id = c.id
            )
        )::INTEGER,
        COUNT(DISTINCT c.id) FILTER (
            WHERE EXISTS (
                SELECT 1 FROM Asset a2
                JOIN Device d2 ON d2.id = a2.id
                WHERE a2.chapter_id = c.id
                  AND d2.status = 'Ready To Donate'
            )
        )::INTEGER,
        COUNT(DISTINCT c.id) FILTER (
            WHERE EXISTS (
                SELECT 1 FROM Asset a2
                JOIN Device d2 ON d2.id = a2.id
                WHERE a2.chapter_id = c.id
                  AND d2.status IN ('Not Started', 'In Progress')
            )
        )::INTEGER
    INTO p_total_chapters, p_active_chapters, p_chapters_with_ready, p_chapters_working
    FROM Chapter c
    WHERE c.name != 'National' AND (p_chapter_ids IS NULL OR c.id = ANY(p_chapter_ids));
END;
$$;
