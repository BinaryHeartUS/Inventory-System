create table Note (
ID integer generated always as identity primary key,
Text varchar(500) NOT NULL,
Date timestamp with time zone NOT NULL,
Asset_ID integer NOT NULL,
foreign key (Asset_ID) references Asset(ID)
);