create table Organization (
ID Integer primary key,
foreign key (ID) references party(ID),
ContactName name_type NULL,
ContactEmail email_type NULL
);