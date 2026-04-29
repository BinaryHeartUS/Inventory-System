DO $$ BEGIN
    CREATE TYPE Charger_Status
    AS ENUM ('Included', 'Not Included', 'Unknown');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;