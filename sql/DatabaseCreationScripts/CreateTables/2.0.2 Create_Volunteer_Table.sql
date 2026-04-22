create table Volunteer (
    ID INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Name Name_Type NOT NULL,
    Username Name_Type UNIQUE NOT NULL
);