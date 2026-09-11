DROP VIEW IF EXISTS Get_Organizations;

CREATE VIEW Get_Organizations
AS
SELECT p.ID, p.Name, p.Location, o.ContactName, o.ContactEmail
FROM Party p
JOIN Organization o ON p.ID = o.ID