DROP PROCEDURE IF EXISTS Get_Avg_Time_In_Inventory;

CREATE OR REPLACE PROCEDURE Get_Avg_Time_In_Inventory(
    IN  p_chapter_ids INTEGER[],
    OUT p_avg_days    NUMERIC,
    OUT p_sample_size INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT AVG(d.Donated_Date - a.Acquisition_Date), COUNT(*)::INTEGER
    INTO p_avg_days, p_sample_size
    FROM Device d
    JOIN Asset a ON d.ID = a.ID
    WHERE d.status = 'Donated'
      AND d.Donated_Date IS NOT NULL
      AND a.Acquisition_Date IS NOT NULL
      AND (p_chapter_ids IS NULL OR a.chapter_id = ANY(p_chapter_ids));
END;
$$;
