CREATE TYPE Storage_Type
AS ENUM ('SSD', 'HDD', 'Flash Storage', 'Unknown');
ALTER TYPE Storage_Type OWNER TO api_user;