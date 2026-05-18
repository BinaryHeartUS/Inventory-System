CREATE TABLE IF NOT EXISTS Laptop_Change_Log (
    ID INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Laptop_ID INTEGER NOT NULL,
    Modified_By Name_Type NOT NULL,
    Modified_At TIMESTAMPTZ DEFAULT now(),
    Transaction_ID BIGINT NOT NULL DEFAULT txid_current(),
    Change_Type Change_Type NOT NULL,
    Old_Design_Battery_Capacity INTEGER NULL,
    New_Design_Battery_Capacity INTEGER NULL,
    Old_Actual_Battery_Capacity INTEGER NULL,
    New_Actual_Battery_Capacity INTEGER NULL,
    Old_Battery_Health NUMERIC GENERATED ALWAYS AS (
        CASE
            WHEN Old_Design_battery_capacity IS NOT NULL AND Old_Actual_battery_capacity IS NOT NULL AND Old_Design_battery_capacity <> 0 THEN (Old_Actual_battery_capacity::NUMERIC / Old_Design_battery_capacity)
            ELSE NULL
        END
    ) STORED,
    New_Battery_Health NUMERIC GENERATED ALWAYS AS (
        CASE
            WHEN New_Design_battery_capacity IS NOT NULL AND New_Actual_battery_capacity IS NOT NULL AND New_Design_battery_capacity <> 0 THEN (New_Actual_battery_capacity::NUMERIC / New_Design_battery_capacity)
            ELSE NULL
        END
    ) STORED,
    Old_Includes_Charger Charger_Status NULL,
    New_Includes_Charger Charger_Status NULL
);