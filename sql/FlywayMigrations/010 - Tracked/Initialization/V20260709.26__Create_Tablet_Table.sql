CREATE TABLE IF NOT EXISTS Tablet (
    ID INTEGER PRIMARY KEY,
    FOREIGN KEY (ID) REFERENCES Device(ID)
        ON UPDATE NO ACTION ON DELETE CASCADE,
    Includes_Charger Charger_Status NOT NULL,
    Working_Battery Working_Battery NOT NULL
);