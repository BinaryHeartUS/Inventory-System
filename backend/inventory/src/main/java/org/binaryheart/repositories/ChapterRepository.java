package org.binaryheart.repositories;

import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.responses.ChapterSummary;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ChapterRepository {

    public List<ChapterSummary> getAllChapters() throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        try (PreparedStatement ps = conn.prepareStatement("SELECT * FROM Get_All_Chapters()");
                ResultSet rs = ps.executeQuery()) {
            List<ChapterSummary> results = new ArrayList<>();
            while (rs.next()) {
                results.add(new ChapterSummary(rs.getInt("ID"), rs.getString("Name")));
            }
            return results;
        }
    }
}
