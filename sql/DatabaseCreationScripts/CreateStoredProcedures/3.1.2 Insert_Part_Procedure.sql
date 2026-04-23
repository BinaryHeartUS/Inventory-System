CREATE OR REPLACE PROCEDURE Insert_Part(
    IN p_Chapter_ID INTEGER,
    IN p_Part_ID INTEGER,
    IN p_Type VARCHAR(50),
    IN p_Description varchar(500),
    IN p_Was_Purchased BOOLEAN,
    IN p_Contained_In INTEGER,
    IN p_Acquisition_Date DATE = NULL,
    IN p_Value MONEY DEFAULT '0',
    IN p_Donor_ID INTEGER = NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_Type_ID INTEGER;
BEGIN
    CALL Insert_Asset(p_Chapter_ID, p_Part_ID, p_Acquisition_Date, p_Value, p_Donor_ID);

    CALL Insert_Part_Type(p_Type, v_Type_ID);

    INSERT INTO Part(ID, Type_ID, Description, Was_Purchased, Contained_In)
    VALUES (p_Part_ID, v_Type_ID, p_Description, p_Was_Purchased, p_Contained_In);
END;
$$;