create table Device (
    ID INTEGER PRIMARY KEY,
    FOREIGN KEY (ID) REFERENCES Asset(ID),
    Manufacturer Manufacturer NOT NULL,
    Model VARCHAR(50) NOT NULL,
    Year INTEGER NULL,
    CHECK (Year >= 1980 AND Year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    CPU VARCHAR(50) NULL,
    RAM INTEGER DEFAULT 0 NOT NULL,
    RAM_Generation RAM_Generation NULL,
    CHECK (RAM >= 0),
    Storage_Amount INTEGER DEFAULT 0 NOT NULL,
    CHECK (Storage_Amount >= 0),
    Storage_Type Storage_Type NULL,
    Status Status NOT NULL,
    Recipient_ID INTEGER NULL,
    FOREIGN KEY (Recipient_ID) REFERENCES Party(ID)
);