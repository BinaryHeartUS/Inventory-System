package org.binaryheart.jobs.chapters;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.binaryheart.DatabaseConnectionService;

public class ChapterSyncRepository {
	public int apply(String chapters) throws SQLException {
		try (Connection connection = DatabaseConnectionService.getConnection();
			PreparedStatement statement = connection.prepareStatement("SELECT Apply_Chapter_Directory(?::jsonb)")) {
			statement.setString(1, chapters);
			try (ResultSet result = statement.executeQuery()) {
				if (!result.next())
					throw new SQLException("Chapter reconciliation returned no result");
				return result.getInt(1);
			}
		}
	}
}
