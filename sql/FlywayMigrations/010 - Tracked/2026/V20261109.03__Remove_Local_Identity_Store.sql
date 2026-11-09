-- Chapter IDs remain local inventory foreign keys; identities now belong to auth.
DROP PROCEDURE IF EXISTS Delete_Affiliation;
DROP PROCEDURE IF EXISTS Delete_Volunteer;
DROP PROCEDURE IF EXISTS Get_Volunteer_By_Username;
DROP PROCEDURE IF EXISTS Insert_Affiliation;
DROP PROCEDURE IF EXISTS Insert_Volunteer_For_Chapter;
DROP PROCEDURE IF EXISTS Insert_Role;
DROP PROCEDURE IF EXISTS Update_Affiliation;
DROP PROCEDURE IF EXISTS Update_Volunteer_Password;
DROP FUNCTION IF EXISTS Get_All_Volunteers;
DROP FUNCTION IF EXISTS Get_Volunteers_For_Chapters;
DROP FUNCTION IF EXISTS Get_Chapter_Roles_For_Volunteer;
DROP PROCEDURE IF EXISTS Insert_Chapter;
DROP PROCEDURE IF EXISTS Delete_Chapter;

DROP TABLE Affiliated_With;
DROP TABLE Volunteer;
DROP TABLE Role;
