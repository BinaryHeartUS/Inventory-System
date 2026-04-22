package org.binaryheart.repositories;

import org.binaryheart.DatabaseConnectionService;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

public class TableAdditionRepository {

    public void createTable(String tableName, String columnName) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        // THIS IS INTENTIONALLY VULNERABLE TO SQL INJECTION - PURELY FOR TESTING
        String sql = "CREATE TABLE \"" + tableName + "\" (\"" + columnName + "\" SERIAL PRIMARY KEY)";
        try (Connection conn = DatabaseConnectionService.getConnection(); Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
        }
    }
}
