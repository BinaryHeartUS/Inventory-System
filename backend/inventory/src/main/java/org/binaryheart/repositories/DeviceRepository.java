package org.binaryheart.repositories;

import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.requests.InsertDesktopRequest;
import org.binaryheart.requests.InsertLaptopRequest;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.SQLException;

public class DeviceRepository {

    private int callCountProcedure(String procedureName) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        CallableStatement stmt = conn.prepareCall("call " + procedureName + "(?)");
        stmt.registerOutParameter(1, java.sql.Types.INTEGER);
        stmt.execute();
        return stmt.getInt(1);
    }

    public int getNumberOfDesktops() throws SQLException {
        return callCountProcedure("Get_Desktop_Count");
    }

    public int getNumberOfLaptops() throws SQLException {
        return callCountProcedure("Get_Laptop_Count");
    }

    public int getNumberOfTablets() throws SQLException {
        return callCountProcedure("Get_Tablet_Count");
    }

    public int getNumberOfReadyToDonateDesktops() throws SQLException {
        return callCountProcedure("Get_ReadyToDonate_Desktop_Count");
    }

    public int getNumberOfReadyToDonateLaptops() throws SQLException {
        return callCountProcedure("Get_ReadyToDonate_Laptop_Count");
    }

    public int getNumberOfReadyToDonateTablets() throws SQLException {
        return callCountProcedure("Get_ReadyToDonate_Tablet_Count");
    }

    public int getNumberOfDonatedDesktops() throws SQLException {
        return callCountProcedure("Get_Donated_Desktop_Count");
    }

    public int getNumberOfDonatedLaptops() throws SQLException {
        return callCountProcedure("Get_Donated_Laptop_Count");
    }

    public int getNumberOfDonatedTablets() throws SQLException {
        return callCountProcedure("Get_Donated_Tablet_Count");
    }

    public void insertDesktop(InsertDesktopRequest request) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        CallableStatement stmt = conn.prepareCall(
                "call Insert_Desktop(?, ?::Manufacturer, ?, ?, ?::Status, ?, ?, ?, ?::Ram_Generation, ?, ?::Storage_Type, ?::Numeric::Money, ?, ?, ?, ?)");
        stmt.setInt(1, request.chapterId());
        stmt.setString(2, request.manufacturer().getDatabaseValue());
        stmt.setString(3, request.model());
        stmt.setInt(4, request.year());
        stmt.setString(5, request.status().getDatabaseValue());
        if (request.assetId() != null) {
            stmt.setInt(6, request.assetId());
        } else {
            stmt.setInt(6, 0);
        }
        if (request.cpu() != null) {
            stmt.setString(7, request.cpu());
        } else {
            stmt.setNull(7, java.sql.Types.VARCHAR);
        }
        if (request.ram() != null) {
            stmt.setInt(8, request.ram());
        } else {
            stmt.setInt(8, 0);
        }
        if (request.ramGeneration() != null) {
            stmt.setString(9, request.ramGeneration().getDatabaseValue());
        } else {
            stmt.setNull(9, java.sql.Types.VARCHAR);
        }
        if (request.storageAmount() != null) {
            stmt.setInt(10, request.storageAmount());
        } else {
            stmt.setInt(10, 0);
        }
        if (request.storageType() != null) {
            stmt.setString(11, request.storageType().getDatabaseValue());
        } else {
            stmt.setNull(11, java.sql.Types.VARCHAR);
        }
        if (request.value() != null) {
            stmt.setDouble(12, request.value());
        } else {
            stmt.setDouble(12, 0);
        }
        if (request.acquisitionDate() != null) {
            stmt.setDate(13, java.sql.Date.valueOf(request.acquisitionDate()));
        } else {
            stmt.setNull(13, java.sql.Types.DATE);
        }
        if (request.recipientId() != null) {
            stmt.setInt(14, request.recipientId());
        } else {
            stmt.setNull(14, java.sql.Types.INTEGER);
        }
        if (request.donorId() != null) {
            stmt.setInt(15, request.donorId());
        } else {
            stmt.setNull(15, java.sql.Types.INTEGER);
        }
        if (request.hasWifi() != null) {
            stmt.setBoolean(16, request.hasWifi());
        } else {
            stmt.setNull(16, java.sql.Types.BOOLEAN);
        }
        stmt.execute();
    }

    public void insertLaptop(InsertLaptopRequest request) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        CallableStatement stmt = conn.prepareCall(
                "call Insert_Laptop(?, ?::Manufacturer, ?, ?, ?::Status, ?::Charger_Status, ?, ?, ?, ?::Ram_Generation, ?, ?::Storage_Type, ?::Numeric::Money, ?, ?, ?, ?, ?)");
        stmt.setInt(1, request.chapterId());
        stmt.setString(2, request.manufacturer().getDatabaseValue());
        stmt.setString(3, request.model());
        stmt.setInt(4, request.year());
        stmt.setString(5, request.status().getDatabaseValue());
        stmt.setString(6, request.includesCharger().getDatabaseValue());
        if (request.assetId() != null) {
            stmt.setInt(7, request.assetId());
        } else {
            stmt.setInt(7, 0);
        }
        if (request.cpu() != null) {
            stmt.setString(8, request.cpu());
        } else {
            stmt.setNull(8, java.sql.Types.VARCHAR);
        }
        if (request.ram() != null) {
            stmt.setInt(9, request.ram());
        } else {
            stmt.setInt(9, 0);
        }
        if (request.ramGeneration() != null) {
            stmt.setString(10, request.ramGeneration().getDatabaseValue());
        } else {
            stmt.setNull(10, java.sql.Types.VARCHAR);
        }
        if (request.storageAmount() != null) {
            stmt.setInt(11, request.storageAmount());
        } else {
            stmt.setInt(11, 0);
        }
        if (request.storageType() != null) {
            stmt.setString(12, request.storageType().getDatabaseValue());
        } else {
            stmt.setNull(12, java.sql.Types.VARCHAR);
        }
        if (request.value() != null) {
            stmt.setDouble(13, request.value());
        } else {
            stmt.setDouble(13, 0);
        }
        if (request.acquisitionDate() != null) {
            stmt.setDate(14, java.sql.Date.valueOf(request.acquisitionDate()));
        } else {
            stmt.setNull(14, java.sql.Types.DATE);
        }
        if (request.recipientId() != null) {
            stmt.setInt(15, request.recipientId());
        } else {
            stmt.setNull(15, java.sql.Types.INTEGER);
        }
        if (request.donorId() != null) {
            stmt.setInt(16, request.donorId());
        } else {
            stmt.setNull(16, java.sql.Types.INTEGER);
        }
        if (request.designBatteryCapacity() != null) {
            stmt.setInt(17, request.designBatteryCapacity());
        } else {
            stmt.setNull(17, java.sql.Types.INTEGER);
        }
        if (request.actualBatteryCapacity() != null) {
            stmt.setInt(18, request.actualBatteryCapacity());
        } else {
            stmt.setNull(18, java.sql.Types.INTEGER);
        }

        stmt.execute();
    }
}
