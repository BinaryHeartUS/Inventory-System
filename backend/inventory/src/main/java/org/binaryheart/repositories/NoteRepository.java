package org.binaryheart.repositories;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.sql.Date;

import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.responses.NoteResponse;

public class NoteRepository {
    public NoteResponse addNote(int assetId, String text) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        CallableStatement stmt = conn.prepareCall("call Insert_Note(?, ?, ?, ?)");
        stmt.setString(1, text);
        Date date = Date.valueOf(LocalDate.now(ZoneId.of("UTC")));
        stmt.setDate(2, date);
        stmt.setInt(3, assetId);
        stmt.registerOutParameter(4, java.sql.Types.INTEGER);
        stmt.execute();

        int noteId = stmt.getInt(4);

        return new NoteResponse(noteId, text, date.toString(), assetId);
    }
}