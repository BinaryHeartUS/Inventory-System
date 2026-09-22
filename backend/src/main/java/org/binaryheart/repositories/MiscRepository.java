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
import org.binaryheart.requests.InsertMiscRequest;
import org.binaryheart.responses.GetMiscResponse;
import org.binaryheart.responses.MiscChangelogResponse;

public class MiscRepository {

	public List<GetMiscResponse> getMiscAssets(int donorId, Integer limit, int offset) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Misc_Page(?, ?, ?)")) {
			stmt.setInt(1, donorId);
			if (limit == null) {
				stmt.setNull(2, Types.INTEGER);
			} else {
				stmt.setInt(2, limit);
			}
			stmt.setInt(3, offset);
			try (ResultSet rs = stmt.executeQuery()) {
				List<GetMiscResponse> assets = new ArrayList<>();
				while (rs.next()) {
					assets.add(mapMisc(rs));
				}
				return assets;
			}
		}
	}

	public GetMiscResponse getMisc(int id) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Misc(?)")) {
			stmt.setInt(1, id);
			try (ResultSet rs = stmt.executeQuery()) {
				return rs.next() ? mapMisc(rs) : null;
			}
		}
	}

	public int insertMisc(InsertMiscRequest request, String username) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection()) {
			conn.setAutoCommit(false);
			try (PreparedStatement user = conn.prepareStatement("SELECT set_config('app.current_username', ?, true)");
				CallableStatement stmt = conn.prepareCall("CALL Insert_Misc(?, ?, ?, ?::Numeric::Money, ?)")) {
				user.setString(1, username);
				user.execute();
				stmt.registerOutParameter(1, Types.INTEGER);
				if (request.assetId() == null) {
					stmt.setNull(1, Types.INTEGER);
				} else {
					stmt.setInt(1, request.assetId());
				}
				stmt.setString(2, request.description());
				setDate(stmt, 3, request.acquisitionDate());
				stmt.setDouble(4, request.value());
				stmt.setInt(5, request.donorId());
				stmt.execute();
				int newId = stmt.getInt(1);
				conn.commit();
				return newId;
			} catch (SQLException e) {
				conn.rollback();
				throw e;
			} finally {
				conn.setAutoCommit(true);
			}
		}
	}

	public void updateMisc(InsertMiscRequest request, String username) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection()) {
			conn.setAutoCommit(false);
			try (PreparedStatement user = conn.prepareStatement("SELECT set_config('app.current_username', ?, true)");
				CallableStatement stmt = conn.prepareCall("CALL Update_Misc(?, ?, ?, ?::Numeric::Money, ?)")) {
				user.setString(1, username);
				user.execute();
				stmt.setInt(1, request.assetId());
				stmt.setString(2, request.description());
				setDate(stmt, 3, request.acquisitionDate());
				stmt.setDouble(4, request.value());
				stmt.setInt(5, request.donorId());
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

	public void deleteMisc(int id) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			CallableStatement stmt = conn.prepareCall("CALL Delete_Misc(?)")) {
			stmt.setInt(1, id);
			stmt.execute();
		}
	}

	public MiscChangelogResponse[] getMiscChangelog(int id) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Misc_Changelog_By_ID(?)")) {
			stmt.setInt(1, id);
			try (ResultSet rs = stmt.executeQuery()) {
				List<MiscChangelogResponse> entries = new ArrayList<>();
				while (rs.next()) {
					entries.add(new MiscChangelogResponse(rs.getInt("id"), rs.getString("modified_by"),
						rs.getObject("modified_at", OffsetDateTime.class), rs.getString("change_type"),
						rs.getObject("old_acquisition_date", LocalDate.class),
						rs.getObject("new_acquisition_date", LocalDate.class), nullableDouble(rs, "old_value"),
						nullableDouble(rs, "new_value"), rs.getObject("old_donor_id", Integer.class),
						rs.getObject("new_donor_id", Integer.class), rs.getString("old_description"),
						rs.getString("new_description")));
				}
				return entries.toArray(new MiscChangelogResponse[0]);
			}
		}
	}

	private static GetMiscResponse mapMisc(ResultSet rs) throws SQLException {
		Date acquisitionDate = rs.getDate("acquisition_date");
		return new GetMiscResponse(rs.getInt("id"), acquisitionDate == null ? null : acquisitionDate.toLocalDate(),
			nullableDouble(rs, "value"), rs.getString("description"), rs.getInt("donor_id"));
	}

	private static Double nullableDouble(ResultSet rs, String column) throws SQLException {
		double value = rs.getDouble(column);
		return rs.wasNull() ? null : value;
	}

	private static void setDate(CallableStatement stmt, int index, LocalDate value) throws SQLException {
		if (value == null) {
			stmt.setNull(index, Types.DATE);
		} else {
			stmt.setDate(index, Date.valueOf(value));
		}
	}
}