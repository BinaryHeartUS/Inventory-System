INSERT INTO Role (Name, Priority)
VALUES
    ('Admin', 100),
    ('Chapter Admin', 200),
    ('Editor', 300),
    ('Viewer', 400)
ON CONFLICT (Name) DO NOTHING;
