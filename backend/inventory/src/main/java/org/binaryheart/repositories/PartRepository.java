package org.binaryheart.repositories;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

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
            int typeId = res.getInt("type_id");
            String desc = res.getString("description");
            boolean wasPurchased = res.getBoolean("was_purchased");
            Integer containedIn = res.getInt("contained_in");
            parts.add(new PartResponse(id, typeId, desc, wasPurchased, containedIn));
        }

        return parts.toArray(new PartResponse[0]);
    }
}
