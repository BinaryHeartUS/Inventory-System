CREATE OR REPLACE VIEW Get_Parts
AS
SELECT p.ID as id, t.Name as type, Description as description, Was_Purchased as wasPurchased, Contained_In as containedIn, a.Chapter_ID as chapterId, a.Acquisition_Date as acquisitionDate, a.Value::NUMERIC as value, a.Donor_ID as donorId
FROM Part p
JOIN Part_Type t on p.Type_ID = t.ID
JOIN Asset a on p.ID = a.ID;