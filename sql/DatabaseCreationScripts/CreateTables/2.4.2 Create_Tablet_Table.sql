create table Tablet (
    ID INTEGER PRIMARY KEY,
    FOREIGN KEY (ID) REFERENCES Device(ID),
    Includes_charger BOOLEAN NOT NULL,
    Has_Cellular BOOLEAN NOT NULL
);