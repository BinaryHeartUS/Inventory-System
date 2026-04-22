package org.binaryheart;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

import org.binaryheart.records.Desktop;

public class DatabaseImporter {
    public static void addDesktopsToDatabase(List<Desktop> desktops, int chapterID) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }

        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Insert_Desktop(?, ?::Manufacturer, ?, ?, ?::Status, ?)")) {
            for (Desktop desktop : desktops) {
                stmt.setInt(1, chapterID);
                stmt.setString(2, desktop.manufacturer().getDatabaseValue());
                stmt.setString(3, desktop.name());
                stmt.setObject(4, desktop.yearReleased(), java.sql.Types.INTEGER);
                stmt.setString(5, desktop.currentStatus().getDatabaseValue());
                stmt.setInt(6, desktop.ID());
                // Desktop's Notes string and DateUpdated are not yet read in (those would be
                // added to the Notes table, not the Desktop table)
                stmt.execute();

                addNote(desktop.notes(), desktop.dateUpdated(), desktop.ID());
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void addNote(String note, LocalDate dateUpdated, int assetID) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }

        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Insert_Note(?, ?, ?)")) {
            stmt.setString(1, note);
            stmt.setObject(2, dateUpdated);
            stmt.setInt(3, assetID);
            stmt.execute();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static int addChapter(String chapterName) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Insert_Chapter(?, ?)")) {
            stmt.setString(1, chapterName);
            stmt.registerOutParameter(2, java.sql.Types.INTEGER);
            stmt.execute();
            return stmt.getInt(2);
        } catch (SQLException e) {
            e.printStackTrace();
            return -1;
        }
    }
}
