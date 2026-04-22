CREATE OR REPLACE PROCEDURE Insert_Chapter(
    IN p_name name_type,
    OUT p_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Chapter (Name)
    VALUES (p_name)
    RETURNING ID INTO p_id;
END;
$$;