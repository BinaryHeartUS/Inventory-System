CREATE OR REPLACE VIEW Get_Devices
AS
SELECT Get_Device_Type(dk.ID, l.ID, t.ID) AS type, a.ID, a.acquisition_date, a.value::NUMERIC, m.name AS manufacturer,
        d.model, d.year, d.cpu, d.ram, r.name AS ram_generation, d.storage_amount, s.name AS storage_type,
        d.status, dk.haswifi, Get_Charger_Status(l.ID, t.ID, l.includes_charger, t.includes_charger) AS includes_charger,
        l.design_battery_capacity, l.actual_battery_capacity, l.battery_health, t.working_battery, c.name AS chapter, d.Donated_Date,
        os.name AS operating_system
FROM Asset a
JOIN Device d ON a.ID = d.ID
LEFT JOIN Desktop dk ON d.ID = dk.ID
LEFT JOIN Laptop l ON d.ID = l.ID
LEFT JOIN Tablet t ON d.ID = t.ID
JOIN Manufacturer m ON d.manufacturer_id = m.id
LEFT JOIN RAM_Generation r ON d.ram_generation_id = r.id
LEFT JOIN Storage_Type s ON d.storage_type_id = s.id
LEFT JOIN Operating_System os ON d.os_id = os.id
JOIN Chapter c ON a.chapter_id = c.id