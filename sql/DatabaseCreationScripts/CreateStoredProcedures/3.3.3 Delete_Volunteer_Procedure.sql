CREATE OR REPLACE PROCEDURE Delete_Volunteer(
    IN p_volunteer_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM Affiliated_With WHERE Volunteer_ID = p_volunteer_id;
    DELETE FROM Volunteer WHERE ID = p_volunteer_id;
END;
$$;
