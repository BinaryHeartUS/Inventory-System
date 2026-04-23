CREATE TYPE Status
AS ENUM ('Not Started', 'In Progress', 'Ready To Donate', 'Donated', 'Unknown');
ALTER TYPE Status OWNER TO api_user;