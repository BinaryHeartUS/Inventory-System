create table Part (
ID integer primary key,
foreign key (ID) references Asset(ID),
Type part_type NOT NULL,
Description varchar(500) NOT NULL,
Was_Purchased boolean NOT NULL,
Contained_In integer NULL,
foreign key (Contained_In) references Device(ID)
);