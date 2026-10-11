DROP PROCEDURE IF EXISTS Delete_Misc;

CREATE OR REPLACE PROCEDURE Delete_Misc(
    IN p_Misc_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM Misc WHERE ID = p_Misc_ID) THEN
        DELETE FROM Asset
        WHERE ID = p_Misc_ID;
    ELSE
        RAISE SQLSTATE '02000'
        USING MESSAGE = 'No misc asset found with matching asset ID';
    END IF;
END;
$$;