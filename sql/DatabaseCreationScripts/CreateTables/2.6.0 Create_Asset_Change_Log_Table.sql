CREATE TABLE IF NOT EXISTS Asset_Change_Log (
    ID INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Asset_ID INTEGER NOT NULL,
    Modified_By Name_Type NOT NULL,
    Modified_At TIMESTAMPTZ DEFAULT now(),
    transaction_id BIGINT NOT NULL DEFAULT txid_current(),
    Change_Type Change_Type NOT NULL,
    Old_Acquisition_Date DATE NULL,
    New_Acquisition_Date DATE NULL,
    Old_Value MONEY NULL,
    New_Value MONEY NULL,
    Old_Chapter_ID INTEGER NULL,
    New_Chapter_ID INTEGER NULL,
    Old_Donor_ID INTEGER NULL,
    New_Donor_ID INTEGER NULL
);