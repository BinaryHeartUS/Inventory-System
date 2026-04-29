CREATE TABLE IF NOT EXISTS Tablet (
    ID INTEGER PRIMARY KEY,
    FOREIGN KEY (ID) REFERENCES Device(ID),
    Includes_Charger Charger_Status NOT NULL,
    Working_Battery Working_Battery NOT NULL
);