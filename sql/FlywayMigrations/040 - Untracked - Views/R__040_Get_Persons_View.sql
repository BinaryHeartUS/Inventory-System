CREATE OR REPLACE VIEW Get_Persons
AS
SELECT p.ID, p.Name, p.Location, per.Email AS IndividualEmail
FROM Party p
JOIN Person per on p.ID = per.ID