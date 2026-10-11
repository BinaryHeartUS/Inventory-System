DROP PROCEDURE IF EXISTS Update_Note;

CREATE OR REPLACE PROCEDURE Update_Note(
    IN p_Text VARCHAR(500),
    IN p_NoteID INTEGER,
    IN p_AssetID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS(SELECT 1
                FROM Note
                WHERE ID = p_NoteID
                    AND Asset_ID = p_AssetID) THEN
        UPDATE Note
        SET Text = p_Text
        WHERE ID = p_NoteID
            AND Asset_ID = p_AssetID;
    ELSE
        RAISE SQLSTATE '02000'
        USING MESSAGE = 'No note with matching note and asset IDs';
    END IF;
END;
$$;