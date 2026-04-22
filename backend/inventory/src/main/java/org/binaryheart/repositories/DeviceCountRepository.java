package org.binaryheart.repositories;

import org.binaryheart.DatabaseConnectionService;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;

public class DeviceCountRepository {

    public int getNumberOfDesktops() throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }

        Connection conn = DatabaseConnectionService.getConnection();

        CallableStatement stmt = conn.prepareCall("call Get_Desktop_Count(?)");
        stmt.registerOutParameter(1, java.sql.Types.INTEGER);
        stmt.execute();
        return stmt.getInt(1);
    }
}
