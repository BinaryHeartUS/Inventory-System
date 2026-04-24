package org.binaryheart.repositories;

import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.models.VolunteerCredentials;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AuthRepository {

    public VolunteerCredentials findByUsername(String username) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Get_Volunteer_By_Username(?, ?, ?, ?)")) {
            stmt.setString(1, username);
            stmt.registerOutParameter(2, Types.INTEGER);
            stmt.registerOutParameter(3, Types.VARCHAR);
            stmt.registerOutParameter(4, Types.ARRAY);
            stmt.execute();

            if (stmt.getObject(2) == null) {
                return null;
            }

            int id = stmt.getInt(2);
            String passwordHash = stmt.getString(3);

            List<Integer> chapterIds = new ArrayList<>();
            Array chapterArray = stmt.getArray(4);
            if (chapterArray != null) {
                for (Integer chapterId : (Integer[]) chapterArray.getArray()) {
                    chapterIds.add(chapterId);
                }
            }

            return new VolunteerCredentials(id, username, passwordHash, chapterIds);
        }
    }
}
