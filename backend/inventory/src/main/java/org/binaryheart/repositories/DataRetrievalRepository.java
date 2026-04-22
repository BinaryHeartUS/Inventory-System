package org.binaryheart.repositories;

import org.binaryheart.DatabaseConnectionService;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class DataRetrievalRepository {

    public List<String> getColumnNames(String tableName) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        List<String> columns = new ArrayList<>();
        try (Connection conn = DatabaseConnectionService.getConnection()) {
            ResultSet rs = conn.getMetaData().getColumns(null, null, tableName, null);
            while (rs.next()) {
                columns.add(rs.getString("COLUMN_NAME"));
            }
        }
        return columns;
    }
}
