package org.binaryheart.repositories;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.requests.InsertToolRequest;
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
            Integer donorID = rs.getObject("donor_id", Integer.class);
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
            Integer donorID = rs.getObject("donor_id", Integer.class);
            return new GetToolResponse(id, localAcquisitionDate, value, description, chapterID, donorID);
        }

        // else nothing was found
        return null;
    }

    public void insertTool(InsertToolRequest request) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        CallableStatement stmt = conn.prepareCall("call Insert_Tool(?, ?, ?, ?, ?::Numeric::Money, ?)");
        stmt.setInt(1, request.chapterId());
        if (request.assetId() != null) {
            stmt.setInt(2, request.assetId());
        } else {
            stmt.setNull(2, java.sql.Types.INTEGER);
        }
        stmt.setString(3, request.description());
        if (request.acquisitionDate() != null) {
            stmt.setDate(4, java.sql.Date.valueOf(request.acquisitionDate()));
        } else {
            stmt.setNull(4, java.sql.Types.DATE);
        }
        if (request.value() != null) {
            stmt.setDouble(5, request.value());
        } else {
            stmt.setDouble(5, 0);
        }
        if (request.donorId() != null) {
            stmt.setInt(6, request.donorId());
        } else {
            stmt.setNull(6, java.sql.Types.INTEGER);
        }
        stmt.execute();
    }

    public void updateTool(InsertToolRequest request) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        CallableStatement stmt = conn.prepareCall("call Update_Tool(?, ?, ?, ?, ?::Numeric::Money, ?)");
        stmt.setInt(1, request.chapterId());
        stmt.setInt(2, request.assetId());
        stmt.setString(3, request.description());
        if (request.acquisitionDate() != null) {
            stmt.setDate(4, java.sql.Date.valueOf(request.acquisitionDate()));
        } else {
            stmt.setNull(4, java.sql.Types.DATE);
        }
        if (request.value() != null) {
            stmt.setDouble(5, request.value());
        } else {
            stmt.setDouble(5, 0);
        }
        if (request.donorId() != null) {
            stmt.setInt(6, request.donorId());
        } else {
            stmt.setNull(6, java.sql.Types.INTEGER);
        }
        stmt.execute();
    }

    public void deleteTool(Integer toolID) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();

        PreparedStatement stmt = conn.prepareCall("call Delete_Tool(?)");
        stmt.setInt(1, toolID);
        stmt.execute();
    }
}
