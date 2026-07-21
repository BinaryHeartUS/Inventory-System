package org.binaryheart.repositories;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.requests.ToolListRequest;
import org.binaryheart.requests.InsertToolRequest;
import org.binaryheart.responses.GetToolResponse;
import org.binaryheart.responses.ToolChangelogResponse;

public class ToolRepository {

	public List<GetToolResponse> getTools(List<Integer> chapterIds, ToolListRequest q) throws SQLException {
		if (!DatabaseConnectionService.isConnected()) {
			DatabaseConnectionService.connect();
		}
		Connection conn = DatabaseConnectionService.getConnection();
		try (PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Tools_Page(?, ?, ?, ?, ?)")) {
			stmt.setArray(1, chapterIds == null ? null : conn.createArrayOf("integer", chapterIds.toArray()));
			if (q.search() == null) {
				stmt.setNull(2, Types.VARCHAR);
			} else {
				stmt.setString(2, q.search());
			}
			if (q.donorId() == null) {
				stmt.setNull(3, Types.INTEGER);
			} else {
				stmt.setInt(3, q.donorId());
			}
			if (q.limit() == null) {
				stmt.setNull(4, Types.INTEGER);
			} else {
				stmt.setInt(4, q.limit());
			}
			stmt.setInt(5, q.offset() == null ? 0 : q.offset());
			ResultSet rs = stmt.executeQuery();
			List<GetToolResponse> tools = new ArrayList<>();
			while (rs.next()) {
				tools.add(mapTool(rs));
			}
			return tools;
		}
	}

	private static GetToolResponse mapTool(ResultSet rs) throws SQLException {
		Integer toolID = rs.getInt("ID");
		Date acquisitionDate = rs.getDate("acquisition_date");
		LocalDate acquisitionLocalDate = acquisitionDate != null ? acquisitionDate.toLocalDate() : null;
		Double value = rs.getDouble("value");
		String description = rs.getString("description");
		Integer chapterID = rs.getInt("chapter_id");
		Integer donorID = rs.getObject("donor_id", Integer.class);
		return new GetToolResponse(toolID, acquisitionLocalDate, value, description, chapterID, donorID);
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
			return mapTool(rs);
		}

		// else nothing was found
		return null;
	}

	public int insertTool(InsertToolRequest request, String username) throws SQLException {
		if (!DatabaseConnectionService.isConnected()) {
			DatabaseConnectionService.connect();
		}
		Connection conn = DatabaseConnectionService.getConnection();
		conn.setAutoCommit(false);
		try {
			PreparedStatement ps = conn.prepareStatement("SELECT set_config('app.current_username', ?, true)");
			ps.setString(1, username);
			ps.execute();
			CallableStatement stmt = conn.prepareCall("call Insert_Tool(?, ?, ?, ?, ?::Numeric::Money, ?)");
			stmt.registerOutParameter(2, java.sql.Types.INTEGER);
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
			int newId = stmt.getInt(2);
			conn.commit();
			return newId;
		} catch (SQLException e) {
			conn.rollback();
			throw e;
		} finally {
			conn.setAutoCommit(true);
		}
	}

	public void updateTool(InsertToolRequest request, String username) throws SQLException {
		if (!DatabaseConnectionService.isConnected()) {
			DatabaseConnectionService.connect();
		}
		Connection conn = DatabaseConnectionService.getConnection();
		conn.setAutoCommit(false);
		try {
			PreparedStatement ps = conn.prepareStatement("SELECT set_config('app.current_username', ?, true)");
			ps.setString(1, username);
			ps.execute();
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
			conn.commit();
		} catch (SQLException e) {
			conn.rollback();
			throw e;
		} finally {
			conn.setAutoCommit(true);
		}
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

	public ToolChangelogResponse[] getToolChangelog(Integer toolId) throws SQLException {
		if (!DatabaseConnectionService.isConnected()) {
			DatabaseConnectionService.connect();
		}
		Connection conn = DatabaseConnectionService.getConnection();
		PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Tool_Changelog_By_ID(?)");
		stmt.setInt(1, toolId);
		stmt.execute();

		ResultSet rs = stmt.getResultSet();
		ArrayList<ToolChangelogResponse> entries = new ArrayList<>();
		while (rs.next()) {
			Integer id = rs.getInt("id");
			String modifiedBy = rs.getString("Modified_By");
			OffsetDateTime modifiedAt = rs.getObject("Modified_At", OffsetDateTime.class);
			String changeType = rs.getString("Change_Type");

			LocalDate oldAcquisitionDate = rs.getObject("Old_Acquisition_Date", LocalDate.class);
			LocalDate newAcquisitionDate = rs.getObject("New_Acquisition_Date", LocalDate.class);

			Double oldValue = rs.getDouble("Old_Value");
			if (rs.wasNull())
				oldValue = null;
			Double newValue = rs.getDouble("New_Value");
			if (rs.wasNull())
				newValue = null;

			Integer oldChapterId = rs.getInt("Old_Chapter_ID");
			if (rs.wasNull())
				oldChapterId = null;
			Integer newChapterId = rs.getInt("New_Chapter_ID");
			if (rs.wasNull())
				newChapterId = null;

			Integer oldDonorId = rs.getInt("Old_Donor_ID");
			if (rs.wasNull())
				oldDonorId = null;
			Integer newDonorId = rs.getInt("New_Donor_ID");
			if (rs.wasNull())
				newDonorId = null;

			String oldDescription = rs.getString("Old_Description");
			String newDescription = rs.getString("New_Description");

			entries.add(new ToolChangelogResponse(id, modifiedBy, modifiedAt, changeType, oldAcquisitionDate,
				newAcquisitionDate, oldValue, newValue, oldChapterId, newChapterId, oldDonorId, newDonorId,
				oldDescription, newDescription));
		}
		return entries.toArray(new ToolChangelogResponse[0]);
	}
}
