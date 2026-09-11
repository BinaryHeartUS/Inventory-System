CREATE TABLE IF NOT EXISTS Tool_Change_Log (
    ID INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Tool_ID INTEGER NOT NULL,
    Modified_By Name_Type NOT NULL,
    Modified_At TIMESTAMPTZ DEFAULT now(),
    transaction_id BIGINT NOT NULL DEFAULT txid_current(),
    Change_Type Change_Type NOT NULL,
    Old_Description VARCHAR(500) NULL,
    New_Description VARCHAR(500) NULL
);