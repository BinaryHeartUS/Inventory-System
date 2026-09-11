DROP PROCEDURE IF EXISTS Insert_Chapter;

CREATE OR REPLACE PROCEDURE Insert_Chapter(
    IN p_name name_type,
    OUT p_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Chapter (Name)
    VALUES (p_name)
    ON CONFLICT (Name) DO NOTHING;

    SELECT ID INTO p_id
    FROM Chapter
    WHERE Name = p_name;
END;
$$;