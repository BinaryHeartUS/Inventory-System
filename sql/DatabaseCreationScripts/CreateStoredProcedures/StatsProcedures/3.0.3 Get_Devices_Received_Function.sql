DROP FUNCTION IF EXISTS Get_Devices_Received(INTEGER[], INTEGER);

CREATE OR REPLACE FUNCTION Get_Devices_Received(
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
        EXTRACT(YEAR FROM a.acquisition_date)::INTEGER AS yr,
        EXTRACT(MONTH FROM a.acquisition_date)::INTEGER AS mo,
        COUNT(*) AS count
    FROM Asset a
    JOIN Device d ON d.id = a.id
    WHERE a.acquisition_date >= date_trunc('month', CURRENT_DATE) - ((p_months - 1) * INTERVAL '1 month')
      AND (p_chapter_ids IS NULL OR a.chapter_id = ANY(p_chapter_ids))
    GROUP BY yr, mo
    ORDER BY yr, mo;
$$;

