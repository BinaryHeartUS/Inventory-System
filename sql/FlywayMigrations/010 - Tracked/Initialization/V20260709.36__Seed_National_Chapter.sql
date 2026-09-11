-- Volunteers affiliated with "National" are granted access to all chapters.

INSERT INTO Chapter (Name)
VALUES ('National')
ON CONFLICT DO NOTHING;
