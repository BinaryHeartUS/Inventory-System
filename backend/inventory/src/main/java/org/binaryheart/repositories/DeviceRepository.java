package org.binaryheart.repositories;

import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.exceptions.DeviceNotFoundException;
import org.binaryheart.requests.InsertDesktopRequest;
import org.binaryheart.requests.InsertLaptopRequest;
import org.binaryheart.requests.InsertTabletRequest;
import org.binaryheart.responses.GetDeviceResponse;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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

    public GetDeviceResponse getDevice(int id) throws SQLException, DeviceNotFoundException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Device(?)");
        stmt.setInt(1, id);
        ResultSet rs = stmt.executeQuery();
        if (!rs.next()) {
            throw new DeviceNotFoundException("Given ID did not match a device in database");
        }
        String deviceType = rs.getString("type");
        Integer deviceID = rs.getInt("ID");
        Date acquisitionDate = rs.getDate("acquisition_date");
        LocalDate acquisitionLocalDate = null;
        if (acquisitionDate != null) {
            acquisitionLocalDate = acquisitionDate.toLocalDate();
        }
        Double value = rs.getDouble("value");
        String manufacturer = rs.getString("manufacturer");
        String model = rs.getString("model");
        Integer year = rs.getInt("year");
        String cpu = rs.getString("cpu");
        Integer ram = rs.getInt("ram");
        String ramGeneration = rs.getString("ram_generation");
        Integer storage = rs.getInt("storage_amount");
        String storageType = rs.getString("storage_type");
        String status = rs.getString("status");
        Boolean hasWifi = rs.getBoolean("has_wifi");
        String hasCharger = rs.getString("includes_charger");
        Integer designCap = rs.getInt("design_capacity");
        Integer actualCap = rs.getInt("actual_capacity");
        Double batteryHealth = rs.getDouble("battery_health");
        String workingBattery = rs.getString("working_battery");
        String chapter = rs.getString("chapter");
        LocalDate dateDonated = rs.getDate("Donated_Date") != null ? rs.getDate("Donated_Date").toLocalDate() : null;
        String operatingSystem = rs.getString("operating_system");
        GetDeviceResponse response = new GetDeviceResponse(deviceType, deviceID, acquisitionLocalDate, value,
                manufacturer, model, year, cpu, ram, ramGeneration, storage, storageType, status, hasWifi, hasCharger,
                designCap, actualCap, batteryHealth, workingBattery, chapter, dateDonated, operatingSystem);
        return response;
    }

    public List<GetDeviceResponse> getAllDevices() throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Devices");
        ResultSet rs = stmt.executeQuery();
        List<GetDeviceResponse> devices = new ArrayList<>();
        while (rs.next()) {
            String deviceType = rs.getString("type");
            Integer deviceID = rs.getInt("ID");
            Date acquisitionDate = rs.getDate("acquisition_date");
            LocalDate acquisitionLocalDate = null;
            if (acquisitionDate != null) {
                acquisitionLocalDate = acquisitionDate.toLocalDate();
            }
            Double value = rs.getDouble("value");
            String manufacturer = rs.getString("manufacturer");
            String model = rs.getString("model");
            Integer year = rs.getInt("year");
            String cpu = rs.getString("cpu");
            Integer ram = rs.getInt("ram");
            String ramGeneration = rs.getString("ram_generation");
            Integer storage = rs.getInt("storage_amount");
            String storageType = rs.getString("storage_type");
            String status = rs.getString("status");
            Boolean hasWifi = rs.getBoolean("haswifi");
            String hasCharger = rs.getString("includes_charger");
            Integer designCap = rs.getInt("design_battery_capacity");
            Integer actualCap = rs.getInt("actual_battery_capacity");
            Double batteryHealth = rs.getDouble("battery_health");
            String workingBattery = rs.getString("working_battery");
            String chapter = rs.getString("chapter");
            LocalDate dateDonated = rs.getDate("Donated_Date") != null ? rs.getDate("Donated_Date").toLocalDate()
                    : null;
            String operatingSystem = rs.getString("operating_system");
            devices.add(new GetDeviceResponse(deviceType, deviceID, acquisitionLocalDate, value, manufacturer, model,
                    year, cpu, ram, ramGeneration, storage, storageType, status, hasWifi, hasCharger, designCap,
                    actualCap, batteryHealth, workingBattery, chapter, dateDonated, operatingSystem));
        }
        return devices;
    }

    public void insertDesktop(InsertDesktopRequest request) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        CallableStatement stmt = conn.prepareCall(
                "call Insert_Desktop(?, ?, ?, ?, ?::Status, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?, ?)");
        stmt.setInt(1, request.chapterId());
        stmt.setString(2, request.manufacturer());
        stmt.setString(3, request.model());
        stmt.setInt(4, request.year());
        stmt.setString(5, request.status());
        if (request.assetId() != null) {
            stmt.setInt(6, request.assetId());
        } else {
            stmt.setNull(6, java.sql.Types.INTEGER);
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
            stmt.setString(9, request.ramGeneration());
        } else {
            stmt.setNull(9, java.sql.Types.VARCHAR);
        }
        if (request.storageAmount() != null) {
            stmt.setInt(10, request.storageAmount());
        } else {
            stmt.setInt(10, 0);
        }
        if (request.storageType() != null) {
            stmt.setString(11, request.storageType());
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
        if (request.operatingSystem() != null) {
            stmt.setString(17, request.operatingSystem());
        } else {
            stmt.setNull(17, java.sql.Types.VARCHAR);
        }
        stmt.execute();
    }

    public void insertLaptop(InsertLaptopRequest request) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        CallableStatement stmt = conn.prepareCall(
                "call Insert_Laptop(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?, ?, ?)");
        stmt.setInt(1, request.chapterId());
        stmt.setString(2, request.manufacturer());
        stmt.setString(3, request.model());
        stmt.setInt(4, request.year());
        stmt.setString(5, request.status());
        stmt.setString(6, request.includesCharger());
        if (request.assetId() != null) {
            stmt.setInt(7, request.assetId());
        } else {
            stmt.setNull(7, java.sql.Types.INTEGER);
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
            stmt.setString(10, request.ramGeneration());
        } else {
            stmt.setNull(10, java.sql.Types.VARCHAR);
        }
        if (request.storageAmount() != null) {
            stmt.setInt(11, request.storageAmount());
        } else {
            stmt.setInt(11, 0);
        }
        if (request.storageType() != null) {
            stmt.setString(12, request.storageType());
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
        if (request.operatingSystem() != null) {
            stmt.setString(19, request.operatingSystem());
        } else {
            stmt.setNull(19, java.sql.Types.VARCHAR);
        }

        stmt.execute();
    }

    public void insertTablet(InsertTabletRequest request) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        CallableStatement stmt = conn.prepareCall(
                "call Insert_Tablet(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?::Working_Battery, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?)");
        stmt.setInt(1, request.chapterId());
        stmt.setString(2, request.manufacturer());
        stmt.setString(3, request.model());
        stmt.setInt(4, request.year());
        stmt.setString(5, request.status());
        stmt.setString(6, request.includesCharger());
        stmt.setString(7, request.workingBattery());
        if (request.assetId() != null) {
            stmt.setInt(8, request.assetId());
        } else {
            stmt.setNull(8, java.sql.Types.INTEGER);
        }
        if (request.cpu() != null) {
            stmt.setString(9, request.cpu());
        } else {
            stmt.setNull(9, java.sql.Types.VARCHAR);
        }
        if (request.ram() != null) {
            stmt.setInt(10, request.ram());
        } else {
            stmt.setInt(10, 0);
        }
        if (request.ramGeneration() != null) {
            stmt.setString(11, request.ramGeneration());
        } else {
            stmt.setNull(11, java.sql.Types.VARCHAR);
        }
        if (request.storageAmount() != null) {
            stmt.setInt(12, request.storageAmount());
        } else {
            stmt.setInt(12, 0);
        }
        if (request.storageType() != null) {
            stmt.setString(13, request.storageType());
        } else {
            stmt.setNull(13, java.sql.Types.VARCHAR);
        }
        if (request.value() != null) {
            stmt.setDouble(14, request.value());
        } else {
            stmt.setDouble(14, 0);
        }
        if (request.acquisitionDate() != null) {
            stmt.setDate(15, java.sql.Date.valueOf(request.acquisitionDate()));
        } else {
            stmt.setNull(15, java.sql.Types.DATE);
        }
        if (request.recipientId() != null) {
            stmt.setInt(16, request.recipientId());
        } else {
            stmt.setNull(16, java.sql.Types.INTEGER);
        }
        if (request.donorId() != null) {
            stmt.setInt(17, request.donorId());
        } else {
            stmt.setNull(17, java.sql.Types.INTEGER);
        }
        if (request.operatingSystem() != null) {
            stmt.setString(18, request.operatingSystem());
        } else {
            stmt.setNull(18, java.sql.Types.VARCHAR);
        }

        stmt.execute();
    }

    public void updateDesktop(InsertDesktopRequest request) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        CallableStatement stmt = conn.prepareCall(
                "call Update_Desktop(?, ?, ?, ?, ?::Status, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?, ?)");
        stmt.setInt(1, request.chapterId());
        stmt.setString(2, request.manufacturer());
        stmt.setString(3, request.model());
        stmt.setInt(4, request.year());
        stmt.setString(5, request.status());
        stmt.setInt(6, request.assetId());
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
            stmt.setString(9, request.ramGeneration());
        } else {
            stmt.setNull(9, java.sql.Types.VARCHAR);
        }
        if (request.storageAmount() != null) {
            stmt.setInt(10, request.storageAmount());
        } else {
            stmt.setInt(10, 0);
        }
        if (request.storageType() != null) {
            stmt.setString(11, request.storageType());
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
        if (request.operatingSystem() != null) {
            stmt.setString(17, request.operatingSystem());
        } else {
            stmt.setNull(17, java.sql.Types.VARCHAR);
        }
        stmt.execute();
    }

    public void updateLaptop(InsertLaptopRequest request) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        CallableStatement stmt = conn.prepareCall(
                "call Update_Laptop(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?, ?, ?)");
        stmt.setInt(1, request.chapterId());
        stmt.setString(2, request.manufacturer());
        stmt.setString(3, request.model());
        stmt.setInt(4, request.year());
        stmt.setString(5, request.status());
        stmt.setString(6, request.includesCharger());
        stmt.setInt(7, request.assetId());
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
            stmt.setString(10, request.ramGeneration());
        } else {
            stmt.setNull(10, java.sql.Types.VARCHAR);
        }
        if (request.storageAmount() != null) {
            stmt.setInt(11, request.storageAmount());
        } else {
            stmt.setInt(11, 0);
        }
        if (request.storageType() != null) {
            stmt.setString(12, request.storageType());
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
        if (request.operatingSystem() != null) {
            stmt.setString(19, request.operatingSystem());
        } else {
            stmt.setNull(19, java.sql.Types.VARCHAR);
        }

        stmt.execute();
    }

    public void updateTablet(InsertTabletRequest request) throws SQLException {
        if (!DatabaseConnectionService.isConnected()) {
            DatabaseConnectionService.connect();
        }
        Connection conn = DatabaseConnectionService.getConnection();
        CallableStatement stmt = conn.prepareCall(
                "call Update_Tablet(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?::Working_Battery, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?)");
        stmt.setInt(1, request.chapterId());
        stmt.setString(2, request.manufacturer());
        stmt.setString(3, request.model());
        stmt.setInt(4, request.year());
        stmt.setString(5, request.status());
        stmt.setString(6, request.includesCharger());
        stmt.setString(7, request.workingBattery());
        stmt.setInt(8, request.assetId());
        if (request.cpu() != null) {
            stmt.setString(9, request.cpu());
        } else {
            stmt.setNull(9, java.sql.Types.VARCHAR);
        }
        if (request.ram() != null) {
            stmt.setInt(10, request.ram());
        } else {
            stmt.setInt(10, 0);
        }
        if (request.ramGeneration() != null) {
            stmt.setString(11, request.ramGeneration());
        } else {
            stmt.setNull(11, java.sql.Types.VARCHAR);
        }
        if (request.storageAmount() != null) {
            stmt.setInt(12, request.storageAmount());
        } else {
            stmt.setInt(12, 0);
        }
        if (request.storageType() != null) {
            stmt.setString(13, request.storageType());
        } else {
            stmt.setNull(13, java.sql.Types.VARCHAR);
        }
        if (request.value() != null) {
            stmt.setDouble(14, request.value());
        } else {
            stmt.setDouble(14, 0);
        }
        if (request.acquisitionDate() != null) {
            stmt.setDate(15, java.sql.Date.valueOf(request.acquisitionDate()));
        } else {
            stmt.setNull(15, java.sql.Types.DATE);
        }
        if (request.recipientId() != null) {
            stmt.setInt(16, request.recipientId());
        } else {
            stmt.setNull(16, java.sql.Types.INTEGER);
        }
        if (request.donorId() != null) {
            stmt.setInt(17, request.donorId());
        } else {
            stmt.setNull(17, java.sql.Types.INTEGER);
        }
        if (request.operatingSystem() != null) {
            stmt.setString(18, request.operatingSystem());
        } else {
            stmt.setNull(18, java.sql.Types.VARCHAR);
        }

        stmt.execute();
    }
}
