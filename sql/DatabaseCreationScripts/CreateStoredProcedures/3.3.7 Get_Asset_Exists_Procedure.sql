CREATE OR REPLACE PROCEDURE Get_Asset_Exists(
    IN p_id INTEGER,
    OUT p_exists BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM Asset WHERE ID = p_id
    ) INTO p_exists;
END;
$$;
