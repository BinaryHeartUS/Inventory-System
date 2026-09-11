DROP FUNCTION IF EXISTS Get_Devices_Donated(INTEGER[], INTEGER);

CREATE OR REPLACE FUNCTION Get_Devices_Donated(
    p_chapter_ids INTEGER[],
    p_months INTEGER
)
RETURNS TABLE(
    yr INTEGER,
    mo INTEGER,
    count BIGINT
)
LANGUAGE sql
AS $$
    SELECT
        EXTRACT(YEAR  FROM d.donated_date)::INTEGER AS yr,
        EXTRACT(MONTH FROM d.donated_date)::INTEGER AS mo,
        COUNT(*) AS count
    FROM Device d
    JOIN Asset a ON a.id = d.id
    WHERE d.status = 'Donated'
      AND d.donated_date >= date_trunc('month', CURRENT_DATE) - ((p_months - 1) * INTERVAL '1 month')
      AND (p_chapter_ids IS NULL OR a.chapter_id = ANY(p_chapter_ids))
    GROUP BY yr, mo
    ORDER BY yr, mo;
$$;
