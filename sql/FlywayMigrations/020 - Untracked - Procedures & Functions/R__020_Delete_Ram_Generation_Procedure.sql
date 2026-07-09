DROP PROCEDURE IF EXISTS Delete_Ram_Generation;

CREATE OR REPLACE PROCEDURE Delete_Ram_Generation(
    IN p_Name VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM Ram_Generation WHERE Name = p_Name;
END;
$$;
