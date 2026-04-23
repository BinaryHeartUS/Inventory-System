CREATE TYPE Role
AS ENUM ('President', 'Vice President', 'Secretary', 'Treasurer', 'Director of Internal Affairs', 'Director of Membership', 'Member', 'Guest');
ALTER TYPE Role OWNER TO api_user;