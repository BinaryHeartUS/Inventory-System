DO $$ BEGIN
    CREATE TYPE Status
    AS ENUM ('Not Started', 'In Progress', 'Ready To Donate', 'Donated', 'Scrapped', 'Unknown');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TYPE Status OWNER TO api_user;