package org.binaryheart.repositories;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.binaryheart.DatabaseConnectionService;

public class HealthRepository {

	public void checkDatabaseConnection() throws SQLException {
		try (Connection connection = DatabaseConnectionService.getConnection();
			PreparedStatement statement = connection.prepareStatement("SELECT 1");
			ResultSet result = statement.executeQuery()) {
			if (!result.next() || result.getInt(1) != 1) {
				throw new SQLException("Database connectivity check returned an unexpected result");
			}
		}
	}
}