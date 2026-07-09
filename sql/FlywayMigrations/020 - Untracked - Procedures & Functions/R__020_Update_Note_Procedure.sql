DROP PROCEDURE IF EXISTS Update_Note;

CREATE OR REPLACE PROCEDURE Update_Note(
    IN p_Text VARCHAR(500),
    IN p_NoteID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS(SELECT 1
                FROM Note
                WHERE id = p_NoteID) THEN
        UPDATE Note
        SET Text = p_Text
        WHERE ID = p_NoteID;
    ELSE
        RAISE SQLSTATE '02000'
        USING MESSAGE = 'No note with matching note ID';
    END IF;
END;
$$;