DO $$
DECLARE
    v_volunteer_id INTEGER;
    v_role_id INTEGER;
    v_viewer_id INTEGER;
    v_national_id INTEGER;
BEGIN
    -- Developer --
    SELECT ID INTO v_role_id FROM Role WHERE Name = 'Admin';

    INSERT INTO Volunteer (Name, Username, Password_Hash, Password_Salt)
    VALUES (
        'Developer',
        'developer',
        'ikUxN0ElSFvFPpFxdwolFA==',
        '3y1QemLCbWe7nMORnVJ44g=='
    )
    ON CONFLICT (Username) DO NOTHING;

    SELECT ID INTO v_volunteer_id FROM Volunteer WHERE Username = 'developer';

    SELECT ID INTO v_national_id FROM Chapter WHERE Name = 'National';

    INSERT INTO Affiliated_With (Volunteer_ID, Chapter_ID, Role_ID)
    VALUES (v_volunteer_id, v_national_id, v_role_id)
    ON CONFLICT (Volunteer_ID, Chapter_ID) DO NOTHING;

    -- Viewer --
    SELECT ID INTO v_viewer_id FROM Role WHERE Name = 'Viewer';

    INSERT INTO Volunteer (Name, Username, Password_Hash, Password_Salt)
    VALUES (
        'viewer',
        'viewer',
        'aGsi+zb5wd9Xnmi1vU637Q==',
        'gC8E6YE1FoszhH82tPXS2Q=='
    )
    ON CONFLICT (Username) DO NOTHING;

    SELECT ID INTO v_volunteer_id FROM Volunteer WHERE Username = 'viewer';

    INSERT INTO Affiliated_With (Volunteer_ID, Chapter_ID, Role_ID)
    VALUES (v_volunteer_id, v_national_id, v_viewer_id)
    ON CONFLICT (Volunteer_ID, Chapter_ID) DO NOTHING;
END;
$$;
