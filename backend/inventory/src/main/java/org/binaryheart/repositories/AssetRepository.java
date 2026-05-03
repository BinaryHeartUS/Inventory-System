package org.binaryheart.repositories;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Types;

import org.binaryheart.DatabaseConnectionService;

public class AssetRepository {

    public boolean assetExists(int id) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Get_Asset_Exists(?, ?)")) {
            stmt.setInt(1, id);
            stmt.registerOutParameter(2, Types.BOOLEAN);
            stmt.execute();
            return stmt.getBoolean(2);
        }
    }
}
