package org.binaryheart.repositories;

import org.binaryheart.DatabaseConnectionService;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;

public class DeviceRepository {

    private int callCountProcedure(String procedureName) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        CallableStatement stmt = conn.prepareCall("call " + procedureName + "(?)");
        stmt.registerOutParameter(1, java.sql.Types.INTEGER);
        stmt.execute();
        return stmt.getInt(1);
    }

    public int getNumberOfDesktops() throws SQLException {
        return callCountProcedure("Get_Desktop_Count");
    }

    public int getNumberOfLaptops() throws SQLException {
        return callCountProcedure("Get_Laptop_Count");
    }

    public int getNumberOfTablets() throws SQLException {
        return callCountProcedure("Get_Tablet_Count");
    }

    public int getNumberOfReadyToDonateDesktops() throws SQLException {
        return callCountProcedure("Get_ReadyToDonate_Desktop_Count");
    }

    public int getNumberOfReadyToDonateLaptops() throws SQLException {
        return callCountProcedure("Get_ReadyToDonate_Laptop_Count");
    }

    public int getNumberOfReadyToDonateTablets() throws SQLException {
        return callCountProcedure("Get_ReadyToDonate_Tablet_Count");
    }

    public int getNumberOfDonatedDesktops() throws SQLException {
        return callCountProcedure("Get_Donated_Desktop_Count");
    }

    public int getNumberOfDonatedLaptops() throws SQLException {
        return callCountProcedure("Get_Donated_Laptop_Count");
    }

    public int getNumberOfDonatedTablets() throws SQLException {
        return callCountProcedure("Get_Donated_Tablet_Count");
    }
}
