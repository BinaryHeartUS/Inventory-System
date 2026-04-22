create table Device (
ID integer primary key,
foreign key (ID) references Asset(ID),
Manufacturer Manufacturer NOT NULL,
Model varchar(50) NOT NULL,
Year integer NOT NULL,
CHECK (Year >= 1980 AND Year <= EXTRACT(YEAR FROM CURRENT_DATE)),
CPU varchar(30) NULL,
RAM integer DEFAULT 0 NOT NULL,
RAM_Generation ram_generation NULL,
CHECK (RAM >= 0),
Storage_Amount integer DEFAULT 0 NOT NULL,
CHECK (Storage_Amount >= 0),
Storage_Type StorageType NULL,
Status Status NOT NULL,
Recipient_ID Integer NULL,
foreign key (Recipient_ID) references Party(ID)
);