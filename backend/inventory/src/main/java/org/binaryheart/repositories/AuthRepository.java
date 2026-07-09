package org.binaryheart.repositories;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.models.ChapterRole;
import org.binaryheart.models.VolunteerCredentials;

public class AuthRepository {

  public VolunteerCredentials findByUsername(String username) throws SQLException {
    if (!DatabaseConnectionService.isConnected()) {
      DatabaseConnectionService.connect();
    }
    Connection conn = DatabaseConnectionService.getConnection();
    try (CallableStatement stmt =
        conn.prepareCall("call Get_Volunteer_By_Username(?, ?, ?, ?, ?)")) {
      stmt.setString(1, username);
      stmt.registerOutParameter(2, Types.INTEGER);
      stmt.registerOutParameter(3, Types.VARCHAR);
      stmt.registerOutParameter(4, Types.VARCHAR);
      stmt.registerOutParameter(5, Types.VARCHAR);
      stmt.execute();

      if (stmt.getObject(2) == null) {
        return null;
      }

      int id = stmt.getInt(2);
      String passwordHash = stmt.getString(3);
      String passwordSalt = stmt.getString(4);
      String effectiveRole = stmt.getString(5);

      List<ChapterRole> chapterRoles = getChapterRoles(conn, id);
      return new VolunteerCredentials(
          id,
          username,
          passwordHash,
          passwordSalt,
          chapterRoles,
          effectiveRole != null ? effectiveRole : "Viewer");
    }
  }

  private List<ChapterRole> getChapterRoles(Connection conn, int volunteerId) throws SQLException {
    try (PreparedStatement ps =
        conn.prepareStatement("SELECT * FROM Get_Chapter_Roles_For_Volunteer(?)")) {
      ps.setInt(1, volunteerId);
      try (ResultSet rs = ps.executeQuery()) {
        List<ChapterRole> list = new ArrayList<>();
        while (rs.next()) {
          list.add(new ChapterRole(rs.getInt("Chapter_ID"), rs.getString("Role_Name")));
        }
        return list;
      }
    }
  }
}
