DROP FUNCTION IF EXISTS Refresh_Stuck_Devices(INTEGER);

CREATE FUNCTION Refresh_Stuck_Devices(
    p_Threshold_Days INTEGER DEFAULT 14
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_Updated_Count INTEGER;
BEGIN
    IF p_Threshold_Days < 1 THEN
        RAISE EXCEPTION 'Stuck-device threshold must be at least one day';
    END IF;

    IF NOT pg_try_advisory_xact_lock(hashtext('refresh_stuck_devices')) THEN
        RETURN 0;
    END IF;

    WITH activity AS (
        SELECT Asset_ID, Modified_At FROM Asset_Change_Log
        UNION ALL
        SELECT Device_ID, Modified_At FROM Device_Change_Log
        UNION ALL
        SELECT Desktop_ID, Modified_At FROM Desktop_Change_Log
        UNION ALL
        SELECT Laptop_ID, Modified_At FROM Laptop_Change_Log
        UNION ALL
        SELECT Tablet_ID, Modified_At FROM Tablet_Change_Log
        UNION ALL
        SELECT Asset_ID, Modified_At FROM Note
    ), latest_activity AS (
        SELECT Asset_ID, MAX(Modified_At) AS Modified_At
        FROM activity
        GROUP BY Asset_ID
    ), desired_state AS (
        SELECT d.ID,
            d.Status NOT IN ('Donated', 'Scrapped')
                AND COALESCE(
                    la.Modified_At,
                    a.Acquisition_Date::timestamp AT TIME ZONE 'America/New_York',
                    CURRENT_TIMESTAMP
                ) < CURRENT_TIMESTAMP - make_interval(days => p_Threshold_Days) AS Device_Stuck
        FROM Device d
        JOIN Asset a ON a.ID = d.ID
        LEFT JOIN latest_activity la ON la.Asset_ID = d.ID
    )
    UPDATE Device d
    SET Device_Stuck = ds.Device_Stuck
    FROM desired_state ds
    WHERE d.ID = ds.ID
      AND d.Device_Stuck IS DISTINCT FROM ds.Device_Stuck;

    GET DIAGNOSTICS v_Updated_Count = ROW_COUNT;
    RETURN v_Updated_Count;
END;
$$;