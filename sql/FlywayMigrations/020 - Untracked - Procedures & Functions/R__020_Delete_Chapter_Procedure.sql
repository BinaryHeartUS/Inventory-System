DROP PROCEDURE IF EXISTS Delete_Chapter;

CREATE OR REPLACE PROCEDURE Delete_Chapter(
    IN p_chapter_id INTEGER
)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM Chapter
    WHERE ID = p_chapter_id;
END;
$$;
