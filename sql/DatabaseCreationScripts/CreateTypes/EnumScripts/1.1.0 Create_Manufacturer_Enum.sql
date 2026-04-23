CREATE TYPE Manufacturer
AS ENUM ('Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'Microsoft', 'Toshiba', 'Samsung', 'Cooler Master', 'Zotac', 'Unknown');
ALTER TYPE Manufacturer OWNER TO api_user;