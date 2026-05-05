package org.binaryheart.repositories;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.responses.GetToolResponse;

public class ToolRepository {

    public List<GetToolResponse> getAllTools() throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Tools");
        ResultSet rs = stmt.executeQuery();
        List<GetToolResponse> tools = new ArrayList<>();
        while (rs.next()) {
            Integer toolID = rs.getInt("ID");
            Date acquisitionDate = rs.getDate("acquisition_date");
            LocalDate acquisitionLocalDate = null;
            if (acquisitionDate != null) {
                acquisitionLocalDate = acquisitionDate.toLocalDate();
            }
            Double value = rs.getDouble("value");
            String description = rs.getString("description");
            Integer chapterID = rs.getInt("chapter_id");
            Integer donorID = rs.getInt("donor_id");
            tools.add(new GetToolResponse(toolID, acquisitionLocalDate, value, description, chapterID, donorID));
        }
        return tools;
    }

    public GetToolResponse getTool(Integer toolID) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();

        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Tool(?)");
        stmt.setInt(1, toolID);
        ResultSet rs = stmt.executeQuery();
        if (rs.next()) {
            int id = rs.getInt("id");
            Date acquisitionDate = rs.getDate("acquisition_date");
            LocalDate localAcquisitionDate = null;
            if (acquisitionDate != null) {
                localAcquisitionDate = acquisitionDate.toLocalDate();
            }
            Double value = rs.getDouble("value");
            String description = rs.getString("description");
            Integer chapterID = rs.getInt("chapter_id");
            Integer donorID = rs.getInt("donor_id");
            return new GetToolResponse(id, localAcquisitionDate, value, description, chapterID, donorID);
        }

        // else nothing was found
        return null;
    }
}
