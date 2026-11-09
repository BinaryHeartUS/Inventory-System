package org.binaryheart.repositories;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.responses.ChapterSummary;

public class ChapterRepository {
	public boolean isChapterActive(int chapterId) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement statement = conn.prepareStatement("SELECT Active FROM Chapter WHERE ID = ?")) {
			statement.setInt(1, chapterId);
			try (ResultSet result = statement.executeQuery()) {
				return result.next() && result.getBoolean("Active");
			}
		}
	}

	public List<ChapterSummary> getAllChapters() throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement ps = conn.prepareStatement("SELECT * FROM Get_All_Chapters()");
			ResultSet rs = ps.executeQuery()) {
			List<ChapterSummary> results = new ArrayList<>();
			while (rs.next()) {
				results.add(new ChapterSummary(rs.getInt("ID"), rs.getString("Name"), rs.getBoolean("Active")));
			}
			return results;
		}
	}

	public int getNationalChapterId() throws SQLException {
		return getAllChapters().stream().filter(c -> "National".equals(c.name())).mapToInt(ChapterSummary::id)
			.findFirst().orElseThrow(() -> new SQLException("National chapter not found"));
	}

	public Integer getChapterIdByName(String name) throws SQLException {
		return getAllChapters().stream().filter(c -> c.name().equals(name)).mapToInt(ChapterSummary::id).boxed()
			.findFirst().orElse(null);
	}

}
