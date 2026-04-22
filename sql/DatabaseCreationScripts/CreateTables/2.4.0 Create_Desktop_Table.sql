create table Desktop (
    ID INTEGER PRIMARY KEY,
    FOREIGN KEY (ID) REFERENCES Device(ID),
    HasWifi BOOLEAN NULL
);