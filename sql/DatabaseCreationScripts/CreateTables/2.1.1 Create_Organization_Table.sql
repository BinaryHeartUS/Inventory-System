create table Organization (
    ID INTEGER PRIMARY KEY,
    FOREIGN KEY (ID) REFERENCES Party(ID),
    ContactName Name_Type NULL,
    ContactEmail Email_Type NULL
);