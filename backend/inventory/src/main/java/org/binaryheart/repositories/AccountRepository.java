package org.binaryheart.repositories;

import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.models.ChapterRole;
import org.binaryheart.responses.AccountSummary;

import java.sql.*;
import java.util.*;

public class AccountRepository {

    public int createVolunteer(String name, String username, String passwordHash, int chapterId, String roleName)
            throws SQLException {
        ensureConnected();
        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Insert_Volunteer_For_Chapter(?, ?, ?, ?, ?, ?)")) {
            stmt.setString(1, name);
            stmt.setString(2, username);
            stmt.setString(3, passwordHash);
            stmt.setInt(4, chapterId);
            stmt.setString(5, roleName);
            stmt.registerOutParameter(6, Types.INTEGER);
            stmt.execute();
            return stmt.getInt(6);
        }
    }

    public List<AccountSummary> getAllVolunteers() throws SQLException {
        ensureConnected();
        Connection conn = DatabaseConnectionService.getConnection();
        try (PreparedStatement ps = conn.prepareStatement("SELECT * FROM Get_All_Volunteers()");
                ResultSet rs = ps.executeQuery()) {
            return mapRows(rs);
        }
    }

    public List<AccountSummary> getVolunteersForChapters(List<Integer> chapterIds) throws SQLException {
        ensureConnected();
        Connection conn = DatabaseConnectionService.getConnection();
        try (PreparedStatement ps = conn.prepareStatement("SELECT * FROM Get_Volunteers_For_Chapters(?)")) {
            Array arr = conn.createArrayOf("INTEGER", chapterIds.toArray());
            ps.setArray(1, arr);
            try (ResultSet rs = ps.executeQuery()) {
                return mapRows(rs);
            }
        }
    }

    public void deleteVolunteer(int volunteerId) throws SQLException {
        ensureConnected();
        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Delete_Volunteer(?)")) {
            stmt.setInt(1, volunteerId);
            stmt.execute();
        }
    }

    public void addAffiliation(int volunteerId, int chapterId, String roleName) throws SQLException {
        ensureConnected();
        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Insert_Affiliation(?, ?, ?)")) {
            stmt.setInt(1, volunteerId);
            stmt.setInt(2, chapterId);
            stmt.setString(3, roleName);
            stmt.execute();
        }
    }

    public void updateAffiliation(int volunteerId, int chapterId, String roleName) throws SQLException {
        ensureConnected();
        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Update_Affiliation(?, ?, ?)")) {
            stmt.setInt(1, volunteerId);
            stmt.setInt(2, chapterId);
            stmt.setString(3, roleName);
            stmt.execute();
        }
    }

    public void deleteAffiliation(int volunteerId, int chapterId) throws SQLException {
        ensureConnected();
        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Delete_Affiliation(?, ?)")) {
            stmt.setInt(1, volunteerId);
            stmt.setInt(2, chapterId);
            stmt.execute();
        }
    }

    private static void ensureConnected() throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
    }

    private static List<AccountSummary> mapRows(ResultSet rs) throws SQLException {
        Map<Integer, String> usernameMap = new LinkedHashMap<>();
        Map<Integer, String> nameMap = new LinkedHashMap<>();
        Map<Integer, List<ChapterRole>> rolesMap = new LinkedHashMap<>();

        while (rs.next()) {
            int id = rs.getInt("ID");
            usernameMap.put(id, rs.getString("Username"));
            nameMap.put(id, rs.getString("Name"));
            rolesMap.computeIfAbsent(id, k -> new ArrayList<>())
                    .add(new ChapterRole(rs.getInt("Chapter_ID"), rs.getString("Role_Name")));
        }

        List<AccountSummary> results = new ArrayList<>();
        for (int id : rolesMap.keySet()) {
            results.add(new AccountSummary(id, usernameMap.get(id), nameMap.get(id), rolesMap.get(id)));
        }
        return results;
    }
}
