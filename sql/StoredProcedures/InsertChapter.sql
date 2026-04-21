CREATE OR REPLACE PROCEDURE InsertChapter(
    IN name TEXT
)
LANGUAGE sql
AS $$
BEGIN
    INSERT INTO chapters (name)
    VALUES (name);
END;
$$;