create table Tool (
ID integer NOT NULL primary key,
Type varchar(20) NOT NULL,
foreign key (ID) references Asset(ID)
);