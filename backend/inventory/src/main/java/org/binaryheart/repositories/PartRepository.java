package org.binaryheart.repositories;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;

import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.responses.PartResponse;

public class PartRepository {
    public PartResponse[] getAllParts() throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        PreparedStatement stmt;
        stmt = conn.prepareStatement("SELECT * FROM Get_Parts");
        stmt.execute();
        ResultSet res = stmt.getResultSet();
        ArrayList<PartResponse> parts = new ArrayList<>();

        while (res.next()) {
            int id = res.getInt("id");
            String type = res.getString("type");
            String desc = res.getString("description");
            boolean wasPurchased = res.getBoolean("wasPurchased");
            Integer containedIn = res.getInt("containedIn");
            if (res.wasNull()) containedIn = null;
            int chapterId = res.getInt("chapterID");
            Date acquisitionDate = res.getDate("acquisitionDate");
            Double value = res.getDouble("value");
            parts.add(new PartResponse(id, type, desc, wasPurchased, containedIn, chapterId, acquisitionDate.toString(),
                    value));
        }

        return parts.toArray(new PartResponse[0]);
    }
}
