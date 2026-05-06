CREATE OR REPLACE PROCEDURE Delete_Part(
    IN p_part_id INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE 
    v_contained_in INTEGER;
BEGIN
    -- check if the part is contained in a device, reject deletion if so
    SELECT Contained_In INTO v_contained_in FROM Part WHERE ID = p_part_id;

    IF v_contained_in IS NOT NULL THEN
        RAISE 'Cannot delete part that is contained in a device';
    END IF;

    -- note: we can delete asset first and part will follow b/c fk cosntraints
    DELETE FROM Asset
    WHERE ID = p_part_id;
END;
$$;
