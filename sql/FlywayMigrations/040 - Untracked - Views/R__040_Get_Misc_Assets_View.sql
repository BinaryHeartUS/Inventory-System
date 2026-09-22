DROP VIEW IF EXISTS Get_Misc_Assets;

CREATE VIEW Get_Misc_Assets
AS
SELECT a.ID, a.Acquisition_Date, a.Value::NUMERIC, m.Description, a.Donor_ID
FROM Asset a
JOIN Misc m ON a.ID = m.ID;