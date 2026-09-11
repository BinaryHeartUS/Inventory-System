DO $$ BEGIN
    CREATE TYPE Address AS (
        street VARCHAR(100),
        city VARCHAR(50),
        state VARCHAR(50),
        zip_code VARCHAR(20),
        country VARCHAR(50)
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;