CREATE TABLE IF NOT EXISTS Desktop_Change_Log (
    ID INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Desktop_ID INTEGER NOT NULL,
    Modified_By Name_Type NOT NULL,
    Modified_At TIMESTAMPTZ DEFAULT now(),
    Transaction_ID BIGINT NOT NULL DEFAULT txid_current(),
    Change_Type Change_Type NOT NULL,
    Old_HasWifi BOOLEAN NULL,
    New_HasWifi BOOLEAN NULL
);