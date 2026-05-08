DROP FUNCTION IF EXISTS Get_Party;

CREATE OR REPLACE FUNCTION Get_Party(
    p_ID INTEGER
)
RETURNS TABLE (
    ID INTEGER,
    Name Name_Type,
    Location ADDRESS,
    IndividualEmail Email_Type,
    ContactName Name_Type
    ContactEmail Email_Type
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM Get_Parties gp
    WHERE gp.ID = p_ID;
END;
$$;