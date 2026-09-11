CREATE TABLE IF NOT EXISTS Part_Change_Log (
    ID INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Part_ID INTEGER NOT NULL,
    Modified_By Name_Type NOT NULL,
    Modified_At TIMESTAMPTZ DEFAULT now(),
    transaction_id BIGINT NOT NULL DEFAULT txid_current(),
    Change_Type Change_Type NOT NULL,
    Old_Type_ID INTEGER NULL,
    New_Type_ID INTEGER NULL,
    Old_Description VARCHAR(500) NULL,
    New_Description VARCHAR(500) NULL,
    Old_Was_Purchased BOOLEAN NULL,
    New_Was_Purchased BOOLEAN NULL,
    Old_Contained_In INTEGER NULL,
    New_Contained_In INTEGER NULL
);