CREATE OR REPLACE VIEW Get_Tools
AS
SELECT a.ID, a.acquisition_date, a.value, t.description, a.chapter_id, a.donor_id
FROM Asset a
JOIN Tool t ON a.ID = t.ID
