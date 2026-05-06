DROP PROCEDURE IF EXISTS Delete_Tool;

CREATE OR REPLACE PROCEDURE Delete_Tool(
    IN p_toolID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- ensure it's actually a tool we're trying to delete
    IF p_toolID IN (SELECT ID FROM Tool) THEN
        -- just delete asset and tool will follow on FK cascade
        DELETE FROM Asset
        WHERE ID = p_toolID;
    ELSE
        RAISE SQLSTATE '02000'
        USING MESSAGE = 'No tool found with matching asset ID';
    END IF;
END;
$$;