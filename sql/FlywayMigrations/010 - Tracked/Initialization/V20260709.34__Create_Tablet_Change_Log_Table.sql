CREATE TABLE IF NOT EXISTS Tablet_Change_Log (
    ID INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Tablet_ID INTEGER NOT NULL,
    Modified_By Name_Type NOT NULL,
    Modified_At TIMESTAMPTZ DEFAULT now(),
    Transaction_ID BIGINT NOT NULL DEFAULT txid_current(),
    Change_Type Change_Type NOT NULL,
    Old_Includes_Charger Charger_Status NULL,
    New_Includes_Charger Charger_Status NULL,
    Old_Working_Battery Working_Battery NULL,
    New_Working_Battery Working_Battery NULL
);