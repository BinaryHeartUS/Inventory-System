package org.binaryheart.repositories;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Date;
import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.requests.InsertPartRequest;
import org.binaryheart.responses.PartChangelogResponse;
import org.binaryheart.responses.PartResponse;

public class PartRepository {
	public PartResponse[] getAllParts() throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Parts");
			ResultSet res = stmt.executeQuery()) {
			ArrayList<PartResponse> parts = new ArrayList<>();

			while (res.next()) {
				int id = res.getInt("id");
				String type = res.getString("type");
				String desc = res.getString("description");
				boolean wasPurchased = res.getBoolean("wasPurchased");
				Integer containedIn = res.getInt("containedIn");
				if (res.wasNull())
					containedIn = null;
				int chapterId = res.getInt("chapterID");
				Date acquisitionDate = res.getDate("acquisitionDate");
				Double value = res.getDouble("value");
				Integer donorId = res.getObject("donorId", Integer.class);
				parts.add(new PartResponse(id, type, desc, wasPurchased, containedIn, chapterId,
					acquisitionDate.toString(), value, donorId));
			}

			return parts.toArray(new PartResponse[0]);
		}
	}

	public PartResponse getPart(Integer partId) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Part_By_ID(?)")) {
			stmt.setInt(1, partId);
			try (ResultSet res = stmt.executeQuery()) {
				if (res.next()) {
					int id = res.getInt("id");
					String type = res.getString("type");
					String desc = res.getString("description");
					boolean wasPurchased = res.getBoolean("wasPurchased");
					Integer containedIn = res.getInt("containedIn");
					if (res.wasNull())
						containedIn = null;
					int chapterId = res.getInt("chapterID");
					Date acquisitionDate = res.getDate("acquisitionDate");
					Double value = res.getDouble("value");
					Integer donorId = res.getInt("donorId");
					if (res.wasNull())
						donorId = null;
					return new PartResponse(id, type, desc, wasPurchased, containedIn, chapterId,
						acquisitionDate != null ? acquisitionDate.toString() : null, value, donorId);
				}

				return null;
			}
		}
	}

	public PartResponse[] getPartsByDevice(Integer deviceId) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Parts_By_Device(?)")) {
			stmt.setInt(1, deviceId);
			try (ResultSet res = stmt.executeQuery()) {
				ArrayList<PartResponse> parts = new ArrayList<>();
				while (res.next()) {
					int id = res.getInt("id");
					String type = res.getString("type");
					String desc = res.getString("description");
					boolean wasPurchased = res.getBoolean("wasPurchased");
					Integer containedIn = res.getInt("containedIn");
					if (res.wasNull())
						containedIn = null;
					int chapterId = res.getInt("chapterId");
					java.sql.Date acquisitionDate = res.getDate("acquisitionDate");
					Double value = res.getDouble("value");
					Integer donorId = res.getInt("donorId");
					if (res.wasNull())
						donorId = null;
					parts.add(new PartResponse(id, type, desc, wasPurchased, containedIn, chapterId,
						acquisitionDate != null ? acquisitionDate.toString() : null, value, donorId));
				}
				return parts.toArray(new PartResponse[0]);
			}
		}
	}

	public void deletePart(Integer partId, String username) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection()) {
			conn.setAutoCommit(false);
			try (PreparedStatement ps = conn.prepareStatement("SELECT set_config('app.current_username', ?, true)");
				CallableStatement stmt = conn.prepareCall("call Delete_Part(?)")) {
				ps.setString(1, username);
				ps.execute();
				stmt.setInt(1, partId);
				stmt.execute();
				conn.commit();
			} catch (SQLException e) {
				conn.rollback();
				throw e;
			} finally {
				conn.setAutoCommit(true);
			}
		}
	}

	public void insertPart(InsertPartRequest request, String username) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection()) {
			conn.setAutoCommit(false);
			try (PreparedStatement ps = conn.prepareStatement("SELECT set_config('app.current_username', ?, true)");
				CallableStatement stmt = conn
					.prepareCall("call Insert_Part(?, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?)")) {
				ps.setString(1, username);
				ps.execute();
				// required parameters
				stmt.setInt(1, request.chapterId());
				stmt.setString(2, request.type());
				stmt.setString(3, request.description());
				stmt.setBoolean(4, request.wasPurchased());

				// optional parameters
				if (request.containedIn() == null) {
					stmt.setNull(5, java.sql.Types.INTEGER);
				} else {
					stmt.setInt(5, request.containedIn());
				}
				if (request.id() == null) {
					stmt.setNull(6, java.sql.Types.INTEGER);
				} else {
					stmt.setInt(6, request.id());
				}
				if (request.acquisitionDate() == null) {
					stmt.setNull(7, java.sql.Types.DATE);
				} else {
					stmt.setDate(7, java.sql.Date.valueOf(request.acquisitionDate()));
				}
				if (request.value() == null) {
					stmt.setDouble(8, 0);
				} else {
					stmt.setDouble(8, request.value());
				}
				if (request.donorId() == null) {
					stmt.setNull(9, java.sql.Types.INTEGER);
				} else {
					stmt.setInt(9, request.donorId());
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
	}

	public void updatePart(InsertPartRequest request, String username) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection()) {
			conn.setAutoCommit(false);
			try (PreparedStatement ps = conn.prepareStatement("SELECT set_config('app.current_username', ?, true)");
				CallableStatement stmt = conn
					.prepareCall("call Update_Part(?, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?)")) {
				ps.setString(1, username);
				ps.execute();
				// required parameters
				stmt.setInt(1, request.chapterId());
				stmt.setString(2, request.type());
				stmt.setString(3, request.description());
				stmt.setBoolean(4, request.wasPurchased());

				// optional parameters
				if (request.containedIn() == null) {
					stmt.setNull(5, java.sql.Types.INTEGER);
				} else {
					stmt.setInt(5, request.containedIn());
				}
				if (request.id() == null) {
					stmt.setNull(6, java.sql.Types.INTEGER);
				} else {
					stmt.setInt(6, request.id());
				}
				if (request.acquisitionDate() == null) {
					stmt.setNull(7, java.sql.Types.DATE);
				} else {
					stmt.setDate(7, java.sql.Date.valueOf(request.acquisitionDate()));
				}
				if (request.value() == null) {
					stmt.setDouble(8, 0);
				} else {
					stmt.setDouble(8, request.value());
				}
				if (request.donorId() == null) {
					stmt.setNull(9, java.sql.Types.INTEGER);
				} else {
					stmt.setInt(9, request.donorId());
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
	}

	public PartChangelogResponse[] getPartChangelog(Integer partId) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Part_Changelog_By_ID(?)")) {
			stmt.setInt(1, partId);
			try (ResultSet rs = stmt.executeQuery()) {
				ArrayList<PartChangelogResponse> entries = new ArrayList<>();
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

					String oldType = rs.getString("Old_type");
					String newType = rs.getString("New_Type");
					String oldDescription = rs.getString("Old_Description");
					String newDescription = rs.getString("New_Description");

					Boolean oldWasPurchased = rs.getBoolean("Old_Was_Purchased");
					if (rs.wasNull())
						oldWasPurchased = null;
					Boolean newWasPurchased = rs.getBoolean("New_Was_Purchased");
					if (rs.wasNull())
						newWasPurchased = null;

					Integer oldContainedIn = rs.getInt("Old_Contained_In");
					if (rs.wasNull())
						oldContainedIn = null;
					Integer newContainedIn = rs.getInt("New_Contained_In");
					if (rs.wasNull())
						newContainedIn = null;

					entries.add(new PartChangelogResponse(id, modifiedBy, modifiedAt, changeType, oldAcquisitionDate,
						newAcquisitionDate, oldValue, newValue, oldChapterId, newChapterId, oldDonorId, newDonorId,
						oldType, newType, oldDescription, newDescription, oldWasPurchased, newWasPurchased,
						oldContainedIn, newContainedIn));
				}
				return entries.toArray(new PartChangelogResponse[0]);
			}
		}
	}
}
