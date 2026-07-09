DROP VIEW IF EXISTS Get_Parties;

CREATE VIEW Get_Parties
AS
SELECT p.ID, p.Name, p.Location, per.Email AS IndividualEmail, o.ContactName, o.ContactEmail
FROM Party p
LEFT JOIN Person per ON p.ID = per.ID
LEFT JOIN Organization o ON p.ID = o.ID