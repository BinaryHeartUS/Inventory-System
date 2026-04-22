create table Part (
    ID INTEGER PRIMARY KEY,
    FOREIGN KEY (ID) REFERENCES Asset(ID),
    Type part_type NOT NULL,
    Description VARCHAR(500) NOT NULL,
    Was_Purchased BOOLEAN NOT NULL,
    Contained_In INTEGER NULL,
    FOREIGN KEY (Contained_In) REFERENCES Device(ID)
);