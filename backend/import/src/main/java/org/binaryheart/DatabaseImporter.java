package org.binaryheart;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

import org.binaryheart.enums.ChargerStatus;
import org.binaryheart.enums.Manufacturer;
import org.binaryheart.enums.Status;
import org.binaryheart.enums.WorkingBattery;
import org.binaryheart.records.Desktop;
import org.binaryheart.records.Laptop;
import org.binaryheart.records.ReadyToDonate;
import org.binaryheart.records.Tablet;

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

                stmt.execute();

                addNote(desktop.notes(), desktop.dateUpdated(), desktop.ID());
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void addLaptopsToDatabase(List<Laptop> laptops, int chapterID) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }

        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn
                .prepareCall("call Insert_Laptop(?, ?::Manufacturer, ?, ?, ?::Status, ?::Charger_Status, ?)")) {
            for (Laptop laptop : laptops) {
                stmt.setInt(1, chapterID);
                stmt.setString(2, laptop.manufacturer().getDatabaseValue());
                stmt.setString(3, laptop.name());
                stmt.setObject(4, laptop.yearReleased(), java.sql.Types.INTEGER);
                stmt.setString(5, laptop.currentStatus().getDatabaseValue());
                stmt.setString(6, laptop.hasCharger().getDatabaseValue());
                stmt.setInt(7, laptop.ID());
                stmt.execute();

                addNote(laptop.notes(), laptop.dateUpdated(), laptop.ID());
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void addTabletsToDatabase(List<Tablet> tablets, int chapterID) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }

        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall(
                "call Insert_Tablet(?, ?::Manufacturer, ?, ?, ?::Status, ?::Charger_Status, ?::Working_Battery, ?)")) {
            for (Tablet tablet : tablets) {
                stmt.setInt(1, chapterID);
                stmt.setString(2, tablet.manufacturer().getDatabaseValue());
                stmt.setString(3, tablet.name());
                stmt.setObject(4, tablet.yearReleased(), java.sql.Types.INTEGER);
                stmt.setString(5, tablet.currentStatus().getDatabaseValue());
                stmt.setString(6, tablet.chargerIncluded().getDatabaseValue());
                stmt.setString(7, tablet.workingBattery().getDatabaseValue());
                stmt.setInt(8, tablet.ID());
                stmt.execute();

                addNote(tablet.notes(), tablet.dateUpdated(), tablet.ID());
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void addReadyToDonateDesktop(ReadyToDonate item, int chapterId) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }

        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall(
                "call Insert_Desktop(?, ?::Manufacturer, ?, ?, ?::Status, ?, ?, ?, ?::Ram_Generation, ?, ?::Storage_Type, ?::Numeric::Money, ?, ?, ?, ?)")) {
            stmt.setInt(1, chapterId);
            stmt.setString(2, Manufacturer.UNKNOWN.getDatabaseValue());
            stmt.setString(3, item.deviceName());
            stmt.setObject(4, item.estimatedYear(), java.sql.Types.INTEGER);
            stmt.setString(5, Status.READY_TO_DONATE.getDatabaseValue());
            stmt.setInt(6, item.ID());
            stmt.setString(7, item.cpu());
            stmt.setInt(8, item.ramAmount());
            stmt.setString(9, item.ramGeneration().getDatabaseValue());
            stmt.setInt(10, item.storageCapacity());
            stmt.setString(11, item.storageType().getDatabaseValue());
            stmt.setDouble(12, item.estimatedValue());
            stmt.setNull(13, java.sql.Types.DATE);
            stmt.setNull(14, java.sql.Types.INTEGER);
            stmt.setNull(15, java.sql.Types.INTEGER);
            stmt.setNull(16, java.sql.Types.BOOLEAN);

            stmt.execute();

            addNote(item.notes(), LocalDate.now(), item.ID());
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void addReadyToDonateTablet(ReadyToDonate item, int chapterId) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }

        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall(
                "call Insert_Tablet(?, ?::Manufacturer, ?, ?, ?::Status, ?::Charger_Status, ?::Working_Battery, ?, ?, ?, ?::Ram_Generation, ?, ?::Storage_Type, ?::Numeric::Money, ?, ?, ?)")) {
            stmt.setInt(1, chapterId);
            stmt.setString(2, Manufacturer.UNKNOWN.getDatabaseValue());
            stmt.setString(3, item.deviceName());
            stmt.setObject(4, item.estimatedYear(), java.sql.Types.INTEGER);
            stmt.setString(5, Status.READY_TO_DONATE.getDatabaseValue());
            stmt.setString(6, ChargerStatus.UNKNOWN.getDatabaseValue());
            stmt.setString(7, WorkingBattery.UNKNOWN.getDatabaseValue());
            stmt.setInt(8, item.ID());
            stmt.setString(9, item.cpu());
            stmt.setInt(10, item.ramAmount());
            stmt.setString(11, item.ramGeneration().getDatabaseValue());
            stmt.setInt(12, item.storageCapacity());
            stmt.setString(13, item.storageType().getDatabaseValue());
            stmt.setDouble(14, item.estimatedValue());
            stmt.setNull(15, java.sql.Types.DATE);
            stmt.setNull(16, java.sql.Types.INTEGER);
            stmt.setNull(17, java.sql.Types.INTEGER);

            stmt.execute();

            addNote(item.notes(), LocalDate.now(), item.ID());
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void addReadyToDonateLaptop(ReadyToDonate item, int chapterId) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }

        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall(
                "call Insert_Laptop(?, ?::Manufacturer, ?, ?, ?::Status, ?::Charger_Status, ?, ?, ?, ?::Ram_Generation, ?, ?::Storage_Type, ?::Numeric::Money, ?, ?, ?, ?, ?)")) {
            stmt.setInt(1, chapterId);
            stmt.setString(2, Manufacturer.UNKNOWN.getDatabaseValue());
            stmt.setString(3, item.deviceName());
            stmt.setObject(4, item.estimatedYear(), java.sql.Types.INTEGER);
            stmt.setString(5, Status.READY_TO_DONATE.getDatabaseValue());
            stmt.setString(6, ChargerStatus.UNKNOWN.getDatabaseValue());
            stmt.setInt(7, item.ID());
            stmt.setString(8, item.cpu());
            stmt.setInt(9, item.ramAmount());
            stmt.setString(10, item.ramGeneration().getDatabaseValue());
            stmt.setInt(11, item.storageCapacity());
            stmt.setString(12, item.storageType().getDatabaseValue());
            stmt.setDouble(13, item.estimatedValue());
            stmt.setNull(14, java.sql.Types.DATE);
            stmt.setNull(15, java.sql.Types.INTEGER);
            stmt.setNull(16, java.sql.Types.INTEGER);
            stmt.setNull(17, java.sql.Types.INTEGER);
            stmt.setNull(18, java.sql.Types.INTEGER);

            stmt.execute();

            addNote(item.notes(), LocalDate.now(), item.ID());
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
