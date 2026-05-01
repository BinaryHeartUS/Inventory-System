CREATE OR REPLACE VIEW Get_Parts
AS
SELECT ID as id, t.Name as type, Description as description, Was_Purchased as wasPurchased, Contained_In as containedIn, a.Chapter_ID as chapterId, a.Acquisition_Date as acquisitionDate, a.Value as value
FROM Part p
JOIN Part_Type t on p.Type_ID = t.UD
JOIN Asset a on p.ID = a.ID;