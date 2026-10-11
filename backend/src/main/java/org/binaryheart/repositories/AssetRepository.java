package org.binaryheart.repositories;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import org.binaryheart.DatabaseConnectionService;

public class AssetRepository {

	public boolean assetExists(int id) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			CallableStatement stmt = conn.prepareCall("call Get_Asset_Exists(?, ?)")) {
			stmt.setInt(1, id);
			stmt.registerOutParameter(2, Types.BOOLEAN);
			stmt.execute();
			return stmt.getBoolean(2);
		}
	}

	public String getAssetType(int id) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT Get_Asset_Type(?)")) {
			stmt.setInt(1, id);
			try (ResultSet rs = stmt.executeQuery()) {
				return rs.next() ? rs.getString(1) : null;
			}
		}
	}
}
