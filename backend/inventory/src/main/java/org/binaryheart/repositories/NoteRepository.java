package org.binaryheart.repositories;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

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

    public NoteResponse[] getNotes(int assetId) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        PreparedStatement stmt;
        stmt = conn.prepareStatement("SELECT * FROM Get_Notes_For_Asset(?)");
        stmt.setInt(1, assetId);
        stmt.execute();
        ResultSet res = stmt.getResultSet();
        ArrayList<NoteResponse> notes = new ArrayList<>();

        while (res.next()) {
            Integer id = res.getInt("ID");
            String text = res.getString("Text");
            Date date = res.getDate("Date");
            Integer asset_id = res.getInt("Asset_ID");
            notes.add(new NoteResponse(id, text, date.toString(), asset_id));
        }

        return notes.toArray(new NoteResponse[0]);
    }
}