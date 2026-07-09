DO $$ BEGIN
    CREATE TYPE Change_Type
    AS ENUM ('Insert', 'Update', 'Delete');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;