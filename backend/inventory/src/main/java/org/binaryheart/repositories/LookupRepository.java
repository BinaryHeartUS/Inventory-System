package org.binaryheart.repositories;

import org.binaryheart.DatabaseConnectionService;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class LookupRepository {

    private List<String> queryNames(String sql) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        try (PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {
            List<String> results = new ArrayList<>();
            while (rs.next()) {
                results.add(rs.getString("Name"));
            }
            return results;
        }
    }

    public List<String> getManufacturers() throws SQLException {
        return queryNames("SELECT Name FROM Manufacturer ORDER BY Name");
    }

    public List<String> getRamGenerations() throws SQLException {
        return queryNames("SELECT Name FROM Ram_Generation ORDER BY Name");
    }

    public List<String> getStorageTypes() throws SQLException {
        return queryNames("SELECT Name FROM Storage_Type ORDER BY Name");
    }

    public List<String> getPartTypes() throws SQLException {
        return queryNames("SELECT Name FROM Part_Type ORDER BY Name");
    }

    public List<String> getToolTypes() throws SQLException {
        return queryNames("SELECT Name FROM Tool_Type ORDER BY Name");
    }
}
