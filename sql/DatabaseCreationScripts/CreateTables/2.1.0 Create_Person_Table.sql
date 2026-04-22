create table Person (
    ID INTEGER PRIMARY KEY,
    FOREIGN KEY (ID) REFERENCES Party(ID),
    Email Email_Type NULL
);