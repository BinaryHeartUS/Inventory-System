create table Desktop (
ID integer primary key,
foreign key (ID) references Device(ID),
HasWifi boolean NULL
);