CREATE TYPE Part_Type
AS ENUM ('SODIMM', 'DIMM', 'M.2 SSD', 'SATA SSD', 'HDD', 'CPU', 'GPU', 'Other');
ALTER TYPE Part_Type OWNER TO api_user;