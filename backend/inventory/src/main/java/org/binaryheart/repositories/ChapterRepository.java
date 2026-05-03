package org.binaryheart.repositories;

import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.responses.ChapterSummary;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ChapterRepository {

    public List<ChapterSummary> getAllChapters() throws SQLException {
        ensureConnected();
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

    public int getNationalChapterId() throws SQLException {
        return getAllChapters().stream().filter(c -> "National".equals(c.name())).mapToInt(ChapterSummary::id)
                .findFirst().orElseThrow(() -> new SQLException("National chapter not found"));
    }

    public Integer getChapterIdByName(String name) throws SQLException {
        return getAllChapters().stream().filter(c -> c.name().equals(name)).mapToInt(ChapterSummary::id).boxed()
                .findFirst().orElse(null);
    }

    public ChapterSummary createChapter(String name) throws SQLException {
        ensureConnected();
        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("CALL Insert_Chapter(?, ?)")) {
            stmt.setString(1, name);
            stmt.registerOutParameter(2, Types.INTEGER);
            stmt.execute();
            int id = stmt.getInt(2);
            return new ChapterSummary(id, name);
        }
    }

    public void deleteChapter(int id) throws SQLException {
        ensureConnected();
        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("CALL Delete_Chapter(?)")) {
            stmt.setInt(1, id);
            stmt.execute();
        }
    }

    private static void ensureConnected() throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
    }
}
