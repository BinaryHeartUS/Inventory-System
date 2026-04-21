CREATE OR REPLACE PROCEDURE InsertNote(
    IN contents TEXT,
    IN date TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
AS $$
BEGIN
    INSERT INTO notes (contents, date)
    VALUES (contents, date);
END;
$$;