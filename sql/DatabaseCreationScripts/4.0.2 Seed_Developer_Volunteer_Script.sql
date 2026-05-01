DO $$
DECLARE
    v_volunteer_id INTEGER;
    v_role_id INTEGER;
    v_national_id INTEGER;
BEGIN
    SELECT ID INTO v_role_id FROM Role WHERE Name = 'Admin';

    INSERT INTO Volunteer (Name, Username, Password_Hash)
    VALUES (
        'Developer',
        'developer',
        '$2a$12$vt.OyANuxJlYbsXcb.ERXOO01cYo88yt.VUjE3XJE3Tbtl/fZypfu'
    )
    ON CONFLICT (Username) DO NOTHING;

    SELECT ID INTO v_volunteer_id FROM Volunteer WHERE Username = 'developer';

    SELECT ID INTO v_national_id FROM Chapter WHERE Name = 'National';

    INSERT INTO Affiliated_With (Volunteer_ID, Chapter_ID, Role_ID)
    VALUES (v_volunteer_id, v_national_id, v_role_id)
    ON CONFLICT (Volunteer_ID, Chapter_ID) DO NOTHING;
END;
$$;
