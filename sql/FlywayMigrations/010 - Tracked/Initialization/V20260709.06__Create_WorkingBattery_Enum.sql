DO $$ BEGIN
    CREATE TYPE Working_Battery
    AS ENUM ('Yes', 'No', 'Unknown');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;