DROP PROCEDURE IF EXISTS Update_Part;

CREATE OR REPLACE PROCEDURE Update_Part(
    IN p_Chapter_ID INTEGER,
    IN p_Type VARCHAR(50),
    IN p_Description VARCHAR(500),
    IN p_Was_Purchased BOOLEAN,
    IN p_Contained_In INTEGER = NULL,
    INOUT p_Part_ID INTEGER = NULL,
    IN p_Acquisition_Date DATE = NULL,
    IN p_Value MONEY DEFAULT '0',
    IN p_Donor_ID INTEGER = NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    p_Type_ID INTEGER;
BEGIN
    IF EXISTS(SELECT 1
                FROM Part
                WHERE ID = p_Part_ID) THEN
        CALL Update_Asset(p_Chapter_ID, p_Part_ID, p_Acquisition_Date, p_Value, p_Donor_ID);

        SELECT pt.ID INTO p_Type_ID
        FROM Part_Type pt
        WHERE pt.Name = p_Type;

        UPDATE Part
        SET Description = p_Description, Was_Purchased = p_Was_Purchased, Contained_In = p_Contained_In, Type_ID = p_Type_ID
        WHERE ID = p_Part_ID;
    ELSE
        RAISE SQLSTATE '02000'
        USING MESSAGE = 'No part with matching asset ID';
    END IF;
END;
$$;