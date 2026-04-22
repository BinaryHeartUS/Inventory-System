create table Volunteer (
ID integer generated always as identity primary key,
Name name_type NOT NULL,
Username name_type UNIQUE NOT NULL
);