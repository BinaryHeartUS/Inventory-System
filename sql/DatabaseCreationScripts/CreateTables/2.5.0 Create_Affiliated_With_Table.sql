create table Affiliated_With (
    Volunteer_ID INTEGER NOT NULL,
    FOREIGN KEY (Volunteer_ID) REFERENCES Volunteer(ID),
    Chapter_ID INTEGER NOT NULL,
    FOREIGN KEY (Chapter_ID) REFERENCES Chapter(ID),
    Role_ID INTEGER NOT NULL,
    FOREIGN KEY (Role_ID) REFERENCES Role(ID),
    PRIMARY KEY (Volunteer_ID, Chapter_ID)
);