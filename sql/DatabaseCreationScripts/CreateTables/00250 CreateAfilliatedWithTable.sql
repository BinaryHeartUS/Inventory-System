create table Affiliated_With (
Volunteer_ID integer NOT NULL,
foreign key (Volunteer_ID) references Volunteer(ID),
Chapter_ID integer NOT NULL,
foreign key (Chapter_ID) references Chapter(ID),
role Role NOT NULL,
PRIMARY KEY (Volunteer_ID, Chapter_ID)
);