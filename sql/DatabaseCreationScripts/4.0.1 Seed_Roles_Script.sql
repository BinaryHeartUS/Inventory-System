INSERT INTO Role (Name, Priority)
VALUES
    ('Admin', 1),
    ('Chapter Admin', 2),
    ('Editor', 3),
    ('Viewer', 4)
ON CONFLICT (Name) DO NOTHING;
