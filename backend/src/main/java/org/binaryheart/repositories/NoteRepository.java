package org.binaryheart.repositories;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.responses.NoteResponse;

public class NoteRepository {
	public NoteResponse addNote(int assetId, String text) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			CallableStatement stmt = conn.prepareCall("call Insert_Note(?, ?, ?, ?)")) {
			stmt.setString(1, text);
			Instant createdAt = Instant.now();
			stmt.setTimestamp(2, Timestamp.from(createdAt));
			stmt.setInt(3, assetId);
			stmt.registerOutParameter(4, java.sql.Types.INTEGER);
			stmt.execute();

			int noteId = stmt.getInt(4);

			return new NoteResponse(noteId, text, createdAt.toString(), assetId);
		}
	}

	public NoteResponse[] getNotes(int assetId) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Notes_For_Asset(?)")) {
			stmt.setInt(1, assetId);
			try (ResultSet res = stmt.executeQuery()) {
				ArrayList<NoteResponse> notes = new ArrayList<>();
				while (res.next()) {
					Integer id = res.getInt("ID");
					String text = res.getString("Text");
					Instant createdAt = res.getTimestamp("Date").toInstant();
					Integer asset_id = res.getInt("Asset_ID");
					notes.add(new NoteResponse(id, text, createdAt.toString(), asset_id));
				}
				return notes.toArray(new NoteResponse[0]);
			}
		}
	}

	public int getAssetChapterId(int assetId) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Asset(?)")) {
			stmt.setInt(1, assetId);
			try (ResultSet rs = stmt.executeQuery()) {
				rs.next();
				return rs.getInt("Chapter_ID");
			}
		}
	}

	public void updateNote(int assetId, int noteId, String text) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			CallableStatement stmt = conn.prepareCall("call Update_Note(?, ?)")) {
			stmt.setString(1, text);
			stmt.setInt(2, noteId);
			stmt.execute();
		}
	}
}
