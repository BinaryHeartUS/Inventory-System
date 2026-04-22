create table Tablet (
ID integer primary key,
foreign key (ID) references Device(ID),
Includes_charger boolean NOT NULL,
Has_Cellular boolean NOT NULL
);