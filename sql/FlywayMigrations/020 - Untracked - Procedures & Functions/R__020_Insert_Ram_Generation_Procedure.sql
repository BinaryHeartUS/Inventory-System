DROP PROCEDURE IF EXISTS Insert_Ram_Generation;

CREATE OR REPLACE PROCEDURE Insert_Ram_Generation(
    IN p_Name VARCHAR(20),
    OUT p_ID INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Ram_Generation (Name)
    VALUES (p_Name)
    ON CONFLICT (Name) DO NOTHING;

    SELECT ID INTO p_ID
    FROM Ram_Generation
    WHERE Name = p_Name;
END;
$$;
