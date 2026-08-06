INSERT INTO Chapter (ID, Name) OVERRIDING SYSTEM VALUE
VALUES
    (1, 'National'),
    (101, 'E2E Test Chapter')
ON CONFLICT DO NOTHING;

INSERT INTO Role (ID, Name, Priority) OVERRIDING SYSTEM VALUE
VALUES
    (1, 'Admin', 100),
    (2, 'Chapter Admin', 200),
    (3, 'Editor', 300),
    (4, 'Viewer', 400)
ON CONFLICT DO NOTHING;

INSERT INTO Manufacturer (ID, Name) OVERRIDING SYSTEM VALUE
VALUES (1, 'Dell'), (2, 'Framework'), (3, 'Lenovo')
ON CONFLICT DO NOTHING;

INSERT INTO Ram_Generation (ID, Name) OVERRIDING SYSTEM VALUE
VALUES (1, 'DDR4'), (2, 'DDR5')
ON CONFLICT DO NOTHING;

INSERT INTO Storage_Type (ID, Name) OVERRIDING SYSTEM VALUE
VALUES (1, 'SSD'), (2, 'NVMe')
ON CONFLICT DO NOTHING;

INSERT INTO Part_Type (ID, Name) OVERRIDING SYSTEM VALUE
VALUES (1, 'RAM'), (2, 'SSD'), (3, 'Charger')
ON CONFLICT DO NOTHING;

INSERT INTO Operating_System (ID, Name) OVERRIDING SYSTEM VALUE
VALUES (1, 'Ubuntu'), (2, 'Windows 11')
ON CONFLICT DO NOTHING;

INSERT INTO Party (ID, Name, Location) OVERRIDING SYSTEM VALUE
VALUES
    (301, 'Test Donor', ROW('1 Test Way', 'Testville', 'GA', '30000', 'USA')::Address),
    (302, 'Test Recipient Org', ROW('2 Test Way', 'Testville', 'GA', '30000', 'USA')::Address)
ON CONFLICT DO NOTHING;

INSERT INTO Person (ID, Email)
VALUES (301, 'donor@example.test')
ON CONFLICT DO NOTHING;

INSERT INTO Organization (ID, ContactName, ContactEmail)
VALUES (302, 'Case Worker', 'recipient@example.test')
ON CONFLICT DO NOTHING;

INSERT INTO Volunteer (ID, Name, Username, Password_Hash, Password_Salt) OVERRIDING SYSTEM VALUE
VALUES
    (42, 'E2E Administrator', 'e2e-admin', '6XNkS7xePE2YYK3IVZVr/Q==', 'ABEiM0RVZneImaq7zN3u/w=='),
    (43, 'E2E Chapter Administrator', 'e2e-chapter-admin', 'AgG20od5vl9x/9R0DnDRkA==', 'ECEyQ1RldoeYqbrL3O3+Dw=='),
    (44, 'E2E Editor', 'e2e-editor', '49DnZ6xwNJDe7mPFflD5PA==', 'IDFCU2R1hpeoucrb7P0OHw=='),
    (45, 'E2E Viewer', 'e2e-viewer', '/TfqXmfkcRbphOzclepI4g==', 'MEFSY3SFlqe4ydrr/A0eLw==')
ON CONFLICT DO NOTHING;

INSERT INTO Affiliated_With (Volunteer_ID, Chapter_ID, Role_ID)
VALUES
    (42, 1, 1),
    (42, 101, 1),
    (43, 101, 2),
    (44, 101, 3),
    (45, 101, 4)
ON CONFLICT DO NOTHING;

INSERT INTO Asset (ID, Acquisition_Date, Value, Chapter_ID, Donor_ID)
VALUES
    (1001, '2026-01-15', 750, 101, 301),
    (1002, '2025-11-10', 300, 101, 301),
    (1003, '2025-12-01', 250, 101, 301),
    (1101, '2026-02-01', 45, 101, 301),
    (1102, '2026-02-02', 70, 101, NULL),
    (1201, '2026-03-01', 25, 101, 301)
ON CONFLICT DO NOTHING;

INSERT INTO Device (
    ID, Manufacturer_ID, Model, Year, CPU, RAM, RAM_Generation_ID,
    Storage_Amount, Storage_Type_ID, Status, Recipient_ID, Donated_Date, OS_ID
)
VALUES
    (1001, 2, 'Laptop 13', 2024, 'Ryzen 7 7840U', 16, 2, 512, 2, 'In Progress', NULL, NULL, 1),
    (1002, 1, 'OptiPlex 7090', 2022, 'Core i5', 8, 1, 256, 1, 'Donated', 302, '2026-02-15', 2),
    (1003, 3, 'ThinkCentre M90q', 2023, 'Core i5', 8, 1, 256, 1, 'Not Started', NULL, NULL, 2)
ON CONFLICT DO NOTHING;

INSERT INTO Laptop (ID, Includes_Charger)
VALUES (1001, 'Included')
ON CONFLICT DO NOTHING;

INSERT INTO Desktop (ID, HasWifi)
VALUES (1002, TRUE), (1003, TRUE)
ON CONFLICT DO NOTHING;

UPDATE Asset_Change_Log
SET Modified_At = CURRENT_TIMESTAMP - INTERVAL '30 days'
WHERE Asset_ID IN (1001, 1003);

UPDATE Device_Change_Log
SET Modified_At = CURRENT_TIMESTAMP - INTERVAL '30 days'
WHERE Device_ID IN (1001, 1003);

UPDATE Desktop_Change_Log
SET Modified_At = CURRENT_TIMESTAMP - INTERVAL '30 days'
WHERE Desktop_ID = 1003;

UPDATE Laptop_Change_Log
SET Modified_At = CURRENT_TIMESTAMP - INTERVAL '30 days'
WHERE Laptop_ID = 1001;

INSERT INTO Note (Text, Date, Asset_ID)
VALUES ('Waiting for replacement battery', CURRENT_TIMESTAMP - INTERVAL '30 days', 1001);

UPDATE Note
SET Modified_At = CURRENT_TIMESTAMP - INTERVAL '30 days'
WHERE Asset_ID = 1001;

SELECT Refresh_Stuck_Devices(14);

INSERT INTO Part (ID, Type_ID, Description, Was_Purchased, Contained_In)
VALUES
    (1101, 1, '16GB DDR5 SODIMM', FALSE, NULL),
    (1102, 2, '1TB NVMe drive', TRUE, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO Tool (ID, Description)
VALUES (1201, 'Precision screwdriver kit')
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('chapter', 'id'), 101, TRUE);
SELECT setval(pg_get_serial_sequence('role', 'id'), 4, TRUE);
SELECT setval(pg_get_serial_sequence('volunteer', 'id'), 45, TRUE);
SELECT setval(pg_get_serial_sequence('party', 'id'), 302, TRUE);
SELECT setval(pg_get_serial_sequence('manufacturer', 'id'), 3, TRUE);
SELECT setval(pg_get_serial_sequence('ram_generation', 'id'), 2, TRUE);
SELECT setval(pg_get_serial_sequence('storage_type', 'id'), 2, TRUE);
SELECT setval(pg_get_serial_sequence('part_type', 'id'), 3, TRUE);
SELECT setval(pg_get_serial_sequence('operating_system', 'id'), 2, TRUE);
SELECT setval(pg_get_serial_sequence('asset', 'id'), 1999, TRUE);