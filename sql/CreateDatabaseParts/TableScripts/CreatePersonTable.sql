create table Person (
ID integer primary key,
foreign key (ID) references party(ID),
Email email_type NULL
);