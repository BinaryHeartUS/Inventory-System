package org.binaryheart;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.binaryheart.enums.ChargerStatus;
import org.binaryheart.enums.Status;
import org.binaryheart.enums.WorkingBattery;
import org.binaryheart.records.Desktop;
import org.binaryheart.records.Laptop;
import org.binaryheart.records.Part;
import org.binaryheart.records.ReadyToDonate;
import org.binaryheart.records.Tablet;
import org.binaryheart.records.Tool;
import org.binaryheart.records.Donated;

public class DatabaseImporter {
    private static final LocalDate IMPORT_ACQUISITION_DATE = LocalDate.parse("10-1-2025",
            DateTimeFormatter.ofPattern("M-d-yyyy"));

    public static void addDesktopsToDatabase(List<Desktop> desktops, int chapterID) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }

        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Insert_Desktop(?, ?, ?, ?, ?::Status, ?)")) {
            for (Desktop desktop : desktops) {
                stmt.setInt(1, chapterID);
                stmt.setString(2, desktop.manufacturer());
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
                .prepareCall("call Insert_Laptop(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?)")) {
            for (Laptop laptop : laptops) {
                stmt.setInt(1, chapterID);
                stmt.setString(2, laptop.manufacturer());
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
        try (CallableStatement stmt = conn
                .prepareCall("call Insert_Tablet(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?::Working_Battery, ?)")) {
            for (Tablet tablet : tablets) {
                stmt.setInt(1, chapterID);
                stmt.setString(2, tablet.manufacturer());
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
                "call Insert_Desktop(?, ?, ?, ?, ?::Status, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?, ?)")) {
            stmt.setInt(1, chapterId);
            stmt.setString(2, item.manufacturer());
            stmt.setString(3, item.deviceName());
            stmt.setObject(4, item.estimatedYear(), java.sql.Types.INTEGER);
            stmt.setString(5, Status.READY_TO_DONATE.getDatabaseValue());
            stmt.setInt(6, item.ID());
            stmt.setString(7, item.cpu());
            stmt.setInt(8, item.ramAmount());
            stmt.setString(9, item.ramGeneration());
            stmt.setInt(10, item.storageCapacity());
            stmt.setString(11, item.storageType());
            stmt.setDouble(12, item.estimatedValue());
            stmt.setDate(13, java.sql.Date.valueOf(IMPORT_ACQUISITION_DATE));
            stmt.setNull(14, java.sql.Types.INTEGER);
            stmt.setNull(15, java.sql.Types.INTEGER);
            stmt.setNull(16, java.sql.Types.BOOLEAN);
            stmt.setString(17, item.os().getDatabaseValue());

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
                "call Insert_Tablet(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?::Working_Battery, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?)")) {
            stmt.setInt(1, chapterId);
            stmt.setString(2, item.manufacturer());
            stmt.setString(3, item.deviceName());
            stmt.setObject(4, item.estimatedYear(), java.sql.Types.INTEGER);
            stmt.setString(5, Status.READY_TO_DONATE.getDatabaseValue());
            stmt.setString(6, ChargerStatus.UNKNOWN.getDatabaseValue());
            stmt.setString(7, WorkingBattery.UNKNOWN.getDatabaseValue());
            stmt.setInt(8, item.ID());
            stmt.setString(9, item.cpu());
            stmt.setInt(10, item.ramAmount());
            stmt.setString(11, item.ramGeneration());
            stmt.setInt(12, item.storageCapacity());
            stmt.setString(13, item.storageType());
            stmt.setDouble(14, item.estimatedValue());
            stmt.setDate(15, java.sql.Date.valueOf(IMPORT_ACQUISITION_DATE));
            stmt.setNull(16, java.sql.Types.INTEGER);
            stmt.setNull(17, java.sql.Types.INTEGER);
            stmt.setString(18, item.os().getDatabaseValue());

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
                "call Insert_Laptop(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?, ?, ?)")) {
            stmt.setInt(1, chapterId);
            stmt.setString(2, item.manufacturer());
            stmt.setString(3, item.deviceName());
            stmt.setObject(4, item.estimatedYear(), java.sql.Types.INTEGER);
            stmt.setString(5, Status.READY_TO_DONATE.getDatabaseValue());
            stmt.setString(6, ChargerStatus.UNKNOWN.getDatabaseValue());
            stmt.setInt(7, item.ID());
            stmt.setString(8, item.cpu());
            stmt.setInt(9, item.ramAmount());
            stmt.setString(10, item.ramGeneration());
            stmt.setInt(11, item.storageCapacity());
            stmt.setString(12, item.storageType());
            stmt.setDouble(13, item.estimatedValue());
            stmt.setDate(14, java.sql.Date.valueOf(IMPORT_ACQUISITION_DATE));
            stmt.setNull(15, java.sql.Types.INTEGER);
            stmt.setNull(16, java.sql.Types.INTEGER);
            stmt.setNull(17, java.sql.Types.INTEGER);
            stmt.setNull(18, java.sql.Types.INTEGER);
            stmt.setString(19, item.os().getDatabaseValue());

            stmt.execute();

            addNote(item.notes(), LocalDate.now(), item.ID());
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void addDonatedDesktop(Donated item, int chapterId, int recipientID) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();

        try (CallableStatement stmt = conn.prepareCall(
                "call Insert_Desktop(?, ?, ?, ?, ?::Status, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?, ?, ?)")) {
            stmt.setInt(1, chapterId);
            stmt.setString(2, item.manufacturer());
            stmt.setString(3, item.deviceName());
            stmt.setObject(4, item.estimatedYear(), java.sql.Types.INTEGER);
            stmt.setString(5, Status.DONATED.getDatabaseValue());
            stmt.setNull(6, java.sql.Types.INTEGER);
            stmt.registerOutParameter(6, java.sql.Types.INTEGER);
            stmt.setString(7, item.cpu());
            stmt.setInt(8, item.ramAmount());
            stmt.setString(9, item.ramGeneration());
            stmt.setInt(10, item.storageCapacity());
            stmt.setString(11, item.storageType());
            stmt.setDouble(12, item.estimatedValue());
            stmt.setDate(13, java.sql.Date.valueOf(IMPORT_ACQUISITION_DATE));
            stmt.setInt(14, recipientID);
            stmt.setNull(15, java.sql.Types.INTEGER);
            stmt.setNull(16, java.sql.Types.BOOLEAN);
            stmt.setString(17, item.os().getDatabaseValue());
            stmt.setDate(18, java.sql.Date.valueOf(item.dateDonated()));

            stmt.execute();

            addNote(item.notes(), LocalDate.now(), stmt.getInt(6));
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void addDonatedTablet(Donated item, int chapterId, int recipientId) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }

        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall(
                "call Insert_Tablet(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?::Working_Battery, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?, ?)")) {
            stmt.setInt(1, chapterId);
            stmt.setString(2, item.manufacturer());
            stmt.setString(3, item.deviceName());
            stmt.setObject(4, item.estimatedYear(), java.sql.Types.INTEGER);
            stmt.setString(5, Status.DONATED.getDatabaseValue());
            stmt.setString(6, ChargerStatus.UNKNOWN.getDatabaseValue());
            stmt.setString(7, WorkingBattery.UNKNOWN.getDatabaseValue());
            stmt.setNull(8, java.sql.Types.INTEGER);
            stmt.registerOutParameter(8, java.sql.Types.INTEGER);
            stmt.setString(9, item.cpu());
            stmt.setInt(10, item.ramAmount());
            stmt.setString(11, item.ramGeneration());
            stmt.setInt(12, item.storageCapacity());
            stmt.setString(13, item.storageType());
            stmt.setDouble(14, item.estimatedValue());
            stmt.setDate(15, java.sql.Date.valueOf(IMPORT_ACQUISITION_DATE));
            stmt.setInt(16, recipientId);
            stmt.setNull(17, java.sql.Types.INTEGER);
            stmt.setString(18, item.os().getDatabaseValue());
            stmt.setDate(19, java.sql.Date.valueOf(item.dateDonated()));

            stmt.execute();

            addNote(item.notes(), LocalDate.now(), stmt.getInt(8));
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void addDonatedLaptop(Donated item, int chapterId, int recipientId) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }

        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall(
                "call Insert_Laptop(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?, ?, ?, ?)")) {
            stmt.setInt(1, chapterId);
            stmt.setString(2, item.manufacturer());
            stmt.setString(3, item.deviceName());
            stmt.setObject(4, item.estimatedYear(), java.sql.Types.INTEGER);
            stmt.setString(5, Status.DONATED.getDatabaseValue());
            stmt.setString(6, ChargerStatus.UNKNOWN.getDatabaseValue());
            stmt.setNull(7, java.sql.Types.INTEGER);
            stmt.registerOutParameter(7, java.sql.Types.INTEGER);
            stmt.setString(8, item.cpu());
            stmt.setInt(9, item.ramAmount());
            stmt.setString(10, item.ramGeneration());
            stmt.setInt(11, item.storageCapacity());
            stmt.setString(12, item.storageType());
            stmt.setDouble(13, item.estimatedValue());
            stmt.setDate(14, java.sql.Date.valueOf(IMPORT_ACQUISITION_DATE));
            stmt.setInt(15, recipientId);
            stmt.setNull(16, java.sql.Types.INTEGER);
            stmt.setNull(17, java.sql.Types.INTEGER);
            stmt.setNull(18, java.sql.Types.INTEGER);
            stmt.setString(19, item.os().getDatabaseValue());
            stmt.setDate(20, java.sql.Date.valueOf(item.dateDonated()));

            stmt.execute();

            addNote(item.notes(), LocalDate.now(), stmt.getInt(7));
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void addNote(String note, LocalDate dateUpdated, int assetID) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }

        if (note == null || note.strip().isEmpty()) {
            return;
        }

        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Insert_Note(?, ?, ?, ?)")) {
            stmt.setString(1, note);
            stmt.setObject(2, dateUpdated);
            stmt.setInt(3, assetID);
            stmt.registerOutParameter(4, java.sql.Types.INTEGER);
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

    public static int addOrGetRecipient(Donated item) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        if (item.isOrganization().equals("Y")) {
            try (CallableStatement stmt = conn.prepareCall(
                    "call Insert_Organization(?, ?::Name_Type, ?::Address, ?::Name_Type, ?::Email_Type)")) {
                stmt.registerOutParameter(1, java.sql.Types.INTEGER);
                stmt.setString(2, item.recipient());
                stmt.setNull(3, java.sql.Types.VARCHAR);
                stmt.setNull(4, java.sql.Types.VARCHAR);
                stmt.setNull(5, java.sql.Types.VARCHAR);
                stmt.execute();
                return stmt.getInt(1);
            } catch (SQLException e) {
                e.printStackTrace();
                return -1;
            }
        } else {
            try (CallableStatement stmt = conn
                    .prepareCall("call Insert_Person(?, ?::Name_Type, ?::Address, ?::Email_Type)")) {
                stmt.registerOutParameter(1, java.sql.Types.INTEGER);
                stmt.setString(2, item.recipient());
                stmt.setNull(3, java.sql.Types.VARCHAR);
                stmt.setNull(4, java.sql.Types.VARCHAR);
                stmt.execute();
                return stmt.getInt(1);
            } catch (SQLException e) {
                e.printStackTrace();
                return -1;
            }
        }
    }

    public static void addParts(List<Part> parts, int chapterID) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Insert_Part(?, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?)")) {
            for (Part part : parts) {
                for (int i = 0; i < part.quantity(); i++) {
                    stmt.setInt(1, chapterID);
                    stmt.setString(2, part.type());
                    stmt.setString(3, part.description());
                    stmt.setBoolean(4, part.wasDonated().equals("N"));
                    stmt.setNull(5, java.sql.Types.INTEGER);
                    stmt.setNull(6, java.sql.Types.INTEGER);
                    stmt.setDate(7, java.sql.Date.valueOf(IMPORT_ACQUISITION_DATE));
                    stmt.setDouble(8, part.value());
                    stmt.setNull(9, java.sql.Types.INTEGER);
                    stmt.execute();
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void addTools(List<Tool> tools, int chapterID) {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        try (CallableStatement stmt = conn.prepareCall("call Insert_Tool(?, ?, ?, ?, ?::Numeric::Money, ?)")) {
            for (Tool tool : tools) {
                for (int i = 0; i < tool.quantity(); i++) {
                    stmt.setInt(1, chapterID);
                    stmt.setNull(2, java.sql.Types.INTEGER);
                    stmt.setString(3, tool.description());
                    stmt.setDate(4, java.sql.Date.valueOf(IMPORT_ACQUISITION_DATE));
                    stmt.setDouble(5, tool.value());
                    stmt.setNull(6, java.sql.Types.INTEGER);
                    stmt.execute();
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
