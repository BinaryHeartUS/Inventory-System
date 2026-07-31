package org.binaryheart.repositories;

import java.sql.Array;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.exceptions.DeviceNotFoundException;
import org.binaryheart.requests.DeviceListRequest;
import org.binaryheart.requests.InsertDesktopRequest;
import org.binaryheart.requests.InsertLaptopRequest;
import org.binaryheart.requests.InsertTabletRequest;
import org.binaryheart.responses.AvgTimeInInventoryResponse;
import org.binaryheart.responses.ChapterActivityStatsResponse;
import org.binaryheart.responses.ChapterInventorySummary;
import org.binaryheart.responses.CompletionRateResponse;
import org.binaryheart.responses.DashboardCountsResponse;
import org.binaryheart.responses.DeviceChangelogResponse;
import org.binaryheart.responses.GetDeviceResponse;
import org.binaryheart.responses.MonthlyCountPoint;
import org.binaryheart.responses.MonthlyValuePoint;

public class DeviceRepository {

	public int getDeviceCountByChapters(String type, String status, List<Integer> chapterIds) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			CallableStatement stmt = conn.prepareCall("call Get_Device_Count_By_Chapters(?, ?, ?, ?)")) {
			stmt.setString(1, type);
			stmt.setString(2, status);
			setIntegerArray(stmt, 3, chapterIds, conn);
			stmt.registerOutParameter(4, Types.INTEGER);
			stmt.execute();
			return stmt.getInt(4);
		}
	}

	public DashboardCountsResponse getDashboardCounts(List<Integer> chapterIds) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			CallableStatement stmt = conn.prepareCall("call Get_Dashboard_Counts(?, ?, ?, ?, ?, ?, ?, ?, ?)")) {
			setIntegerArray(stmt, 1, chapterIds, conn);
			stmt.registerOutParameter(2, Types.INTEGER);
			stmt.registerOutParameter(3, Types.INTEGER);
			stmt.registerOutParameter(4, Types.INTEGER);
			stmt.registerOutParameter(5, Types.INTEGER);
			stmt.registerOutParameter(6, Types.INTEGER);
			stmt.registerOutParameter(7, Types.INTEGER);
			stmt.registerOutParameter(8, Types.INTEGER);
			stmt.registerOutParameter(9, Types.INTEGER);
			stmt.execute();
			return new DashboardCountsResponse(stmt.getInt(2), stmt.getInt(3), stmt.getInt(4), stmt.getInt(5),
				stmt.getInt(6), stmt.getInt(7), stmt.getInt(8), stmt.getInt(9));
		}
	}

	public AvgTimeInInventoryResponse getAvgTimeInInventory(List<Integer> chapterIds) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			CallableStatement stmt = conn.prepareCall("call Get_Avg_Time_In_Inventory(?, ?, ?)")) {
			setIntegerArray(stmt, 1, chapterIds, conn);
			stmt.registerOutParameter(2, Types.NUMERIC);
			stmt.registerOutParameter(3, Types.INTEGER);
			stmt.execute();
			java.math.BigDecimal avgDecimal = stmt.getBigDecimal(2);
			Double avgDays = (avgDecimal != null) ? avgDecimal.doubleValue() : null;
			int sampleSize = stmt.getInt(3);
			return new AvgTimeInInventoryResponse(avgDays, sampleSize);
		}
	}

	public CompletionRateResponse getCompletionRate(List<Integer> chapterIds) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			CallableStatement stmt = conn.prepareCall("call Get_Completion_Rate(?, ?, ?)")) {
			setIntegerArray(stmt, 1, chapterIds, conn);
			stmt.registerOutParameter(2, Types.INTEGER);
			stmt.registerOutParameter(3, Types.INTEGER);
			stmt.execute();
			return new CompletionRateResponse(stmt.getInt(2), stmt.getInt(3));
		}
	}

	public ChapterActivityStatsResponse getChapterActivityStats(List<Integer> chapterIds) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			CallableStatement stmt = conn.prepareCall("call Get_Chapter_Activity_Stats(?, ?, ?, ?, ?)")) {
			setIntegerArray(stmt, 1, chapterIds, conn);
			stmt.registerOutParameter(2, Types.INTEGER);
			stmt.registerOutParameter(3, Types.INTEGER);
			stmt.registerOutParameter(4, Types.INTEGER);
			stmt.registerOutParameter(5, Types.INTEGER);
			stmt.execute();
			return new ChapterActivityStatsResponse(stmt.getInt(2), stmt.getInt(3), stmt.getInt(4), stmt.getInt(5));
		}
	}

	public List<MonthlyCountPoint> getDevicesReceived(List<Integer> chapterIds, int months) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT yr, mo, count FROM Get_Devices_Received(?, ?)")) {
			stmt.setArray(1, toSqlArray(chapterIds, conn));
			stmt.setInt(2, months);
			ResultSet rs = stmt.executeQuery();
			List<MonthlyCountPoint> points = new ArrayList<>();
			while (rs.next()) {
				points.add(new MonthlyCountPoint(rs.getInt("yr"), rs.getInt("mo"), rs.getLong("count")));
			}
			return points;
		}
	}

	public List<MonthlyCountPoint> getDevicesDonated(List<Integer> chapterIds, int months) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT yr, mo, count FROM Get_Devices_Donated(?, ?)")) {
			stmt.setArray(1, toSqlArray(chapterIds, conn));
			stmt.setInt(2, months);
			ResultSet rs = stmt.executeQuery();
			List<MonthlyCountPoint> points = new ArrayList<>();
			while (rs.next()) {
				points.add(new MonthlyCountPoint(rs.getInt("yr"), rs.getInt("mo"), rs.getLong("count")));
			}
			return points;
		}
	}

	public List<MonthlyValuePoint> getDonatedDeviceValue(List<Integer> chapterIds, int months) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn
				.prepareStatement("SELECT yr, mo, total_value FROM Get_Donated_Device_Value(?, ?)")) {
			Array arr = toSqlArray(chapterIds, conn);
			stmt.setArray(1, arr);
			stmt.setInt(2, months);
			ResultSet rs = stmt.executeQuery();
			List<MonthlyValuePoint> points = new ArrayList<>();
			while (rs.next()) {
				points.add(new MonthlyValuePoint(rs.getInt("yr"), rs.getInt("mo"), rs.getDouble("total_value")));
			}
			return points;
		}
	}

	public List<ChapterInventorySummary> getChapterInventorySummary(List<Integer> chapterIds) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Chapter_Inventory_Summary(?)")) {
			stmt.setArray(1, toSqlArray(chapterIds, conn));
			ResultSet rs = stmt.executeQuery();
			List<ChapterInventorySummary> summaries = new ArrayList<>();
			while (rs.next()) {
				summaries.add(new ChapterInventorySummary(rs.getInt("chapter_id"), rs.getString("chapter_name"),
					rs.getInt("desktop_count"), rs.getInt("laptop_count"), rs.getInt("tablet_count"),
					rs.getInt("not_started"), rs.getInt("in_progress"), rs.getInt("ready_to_donate"),
					rs.getInt("donated"), rs.getInt("scrapped"), rs.getInt("total_devices"), rs.getInt("parts_count"),
					rs.getInt("tools_count")));
			}
			return summaries;
		}
	}

	private static void setIntegerArray(CallableStatement stmt, int paramIndex, List<Integer> ids, Connection conn)
		throws SQLException {
		stmt.setArray(paramIndex, toSqlArray(ids, conn));
	}

	private static Array toSqlArray(List<Integer> ids, Connection conn) throws SQLException {
		if (ids == null || ids.isEmpty()) {
			return null;
		}
		return conn.createArrayOf("integer", ids.toArray());
	}

	public GetDeviceResponse getDevice(int id) throws SQLException, DeviceNotFoundException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Device(?)")) {
			stmt.setInt(1, id);
			ResultSet rs = stmt.executeQuery();
			if (!rs.next()) {
				throw new DeviceNotFoundException("Given ID did not match a device in database");
			}
			return mapDevice(rs);
		}
	}

	public List<GetDeviceResponse> getDevices(List<Integer> chapterIds, DeviceListRequest q) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement(
				"SELECT * FROM Get_Devices_Page(?, ?, ?, CAST(? AS Status), ?, ?, ?, ?, ?, ?, ?, ?)")) {
			stmt.setArray(1, toSqlArray(chapterIds, conn));
			setStringOrNull(stmt, 2, q.search());
			setStringOrNull(stmt, 3, q.type());
			setStringOrNull(stmt, 4, q.status());
			stmt.setBoolean(5, q.includeDonated());
			stmt.setBoolean(6, q.includeScrapped());
			setIntegerOrNull(stmt, 7, q.donorId());
			setIntegerOrNull(stmt, 8, q.recipientId());
			stmt.setString(9, q.sort() == null ? "id" : q.sort());
			stmt.setString(10, q.dir() == null ? "asc" : q.dir());
			setIntegerOrNull(stmt, 11, q.limit());
			stmt.setInt(12, q.offset() == null ? 0 : q.offset());
			ResultSet rs = stmt.executeQuery();
			List<GetDeviceResponse> devices = new ArrayList<>();
			while (rs.next()) {
				devices.add(mapDevice(rs));
			}
			return devices;
		}
	}

	private static GetDeviceResponse mapDevice(ResultSet rs) throws SQLException {
		String deviceType = rs.getString("type");
		Integer deviceID = rs.getInt("ID");
		Date acquisitionDate = rs.getDate("acquisition_date");
		LocalDate acquisitionLocalDate = acquisitionDate != null ? acquisitionDate.toLocalDate() : null;
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
		Integer donorId = rs.getObject("donor_id", Integer.class);
		Integer recipientId = rs.getObject("recipient_id", Integer.class);
		return new GetDeviceResponse(deviceType, deviceID, acquisitionLocalDate, value, manufacturer, model, year, cpu,
			ram, ramGeneration, storage, storageType, status, hasWifi, hasCharger, designCap, actualCap, batteryHealth,
			workingBattery, chapter, dateDonated, operatingSystem, donorId, recipientId);
	}

	private static void setStringOrNull(PreparedStatement stmt, int index, String value) throws SQLException {
		if (value == null) {
			stmt.setNull(index, Types.VARCHAR);
		} else {
			stmt.setString(index, value);
		}
	}

	private static void setIntegerOrNull(PreparedStatement stmt, int index, Integer value) throws SQLException {
		if (value == null) {
			stmt.setNull(index, Types.INTEGER);
		} else {
			stmt.setInt(index, value);
		}
	}

	public int insertDesktop(InsertDesktopRequest request, String username) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection()) {
			conn.setAutoCommit(false);
			try (PreparedStatement ps = conn.prepareStatement("SELECT set_config('app.current_username', ?, true)");
				CallableStatement stmt = conn.prepareCall(
					"call Insert_Desktop(?, ?, ?, ?, ?::Status, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?, ?)")) {
				ps.setString(1, username);
				ps.execute();
				stmt.registerOutParameter(6, java.sql.Types.INTEGER);
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
				int newId = stmt.getInt(6);
				conn.commit();
				return newId;
			} catch (SQLException e) {
				conn.rollback();
				throw e;
			} finally {
				conn.setAutoCommit(true);
			}
		}
	}

	public int insertLaptop(InsertLaptopRequest request, String username) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection()) {
			conn.setAutoCommit(false);
			try (PreparedStatement ps = conn.prepareStatement("SELECT set_config('app.current_username', ?, true)");
				CallableStatement stmt = conn.prepareCall(
					"call Insert_Laptop(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?, ?, ?)")) {
				ps.setString(1, username);
				ps.execute();
				stmt.registerOutParameter(7, java.sql.Types.INTEGER);
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
				int newId = stmt.getInt(7);
				conn.commit();
				return newId;
			} catch (SQLException e) {
				conn.rollback();
				throw e;
			} finally {
				conn.setAutoCommit(true);
			}
		}
	}

	public int insertTablet(InsertTabletRequest request, String username) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection()) {
			conn.setAutoCommit(false);
			try (PreparedStatement ps = conn.prepareStatement("SELECT set_config('app.current_username', ?, true)");
				CallableStatement stmt = conn.prepareCall(
					"call Insert_Tablet(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?::Working_Battery, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?)")) {
				ps.setString(1, username);
				ps.execute();
				stmt.registerOutParameter(8, java.sql.Types.INTEGER);
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
				int newId = stmt.getInt(8);
				conn.commit();
				return newId;
			} catch (SQLException e) {
				conn.rollback();
				throw e;
			} finally {
				conn.setAutoCommit(true);
			}
		}
	}

	public void updateDesktop(InsertDesktopRequest request, String username) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection()) {
			conn.setAutoCommit(false);
			try (PreparedStatement ps = conn.prepareStatement("SELECT set_config('app.current_username', ?, true)");
				CallableStatement stmt = conn.prepareCall(
					"call Update_Desktop(?, ?, ?, ?, ?::Status, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?, ?)")) {
				ps.setString(1, username);
				ps.execute();
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
				conn.commit();
			} catch (SQLException e) {
				conn.rollback();
				throw e;
			} finally {
				conn.setAutoCommit(true);
			}
		}
	}

	public void updateLaptop(InsertLaptopRequest request, String username) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection()) {
			conn.setAutoCommit(false);
			try (PreparedStatement ps = conn.prepareStatement("SELECT set_config('app.current_username', ?, true)");
				CallableStatement stmt = conn.prepareCall(
					"call Update_Laptop(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?, ?, ?)")) {
				ps.setString(1, username);
				ps.execute();
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
				conn.commit();
			} catch (SQLException e) {
				conn.rollback();
				throw e;
			} finally {
				conn.setAutoCommit(true);
			}
		}
	}

	public void updateTablet(InsertTabletRequest request, String username) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection()) {
			conn.setAutoCommit(false);
			try (PreparedStatement ps = conn.prepareStatement("SELECT set_config('app.current_username', ?, true)");
				CallableStatement stmt = conn.prepareCall(
					"call Update_Tablet(?, ?, ?, ?, ?::Status, ?::Charger_Status, ?::Working_Battery, ?, ?, ?, ?, ?, ?, ?::Numeric::Money, ?, ?, ?, ?)")) {
				ps.setString(1, username);
				ps.execute();
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
				conn.commit();
			} catch (SQLException e) {
				conn.rollback();
				throw e;
			} finally {
				conn.setAutoCommit(true);
			}
		}
	}

	public DeviceChangelogResponse[] getDeviceChangelog(Integer deviceID) throws SQLException {
		try (Connection conn = DatabaseConnectionService.getConnection();
			PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Get_Device_Changelog_By_ID(?)")) {
			stmt.setInt(1, deviceID);
			try (ResultSet rs = stmt.executeQuery()) {
				ArrayList<DeviceChangelogResponse> entries = new ArrayList<>();
				while (rs.next()) {
					// extract the device changelog fields
					String deviceType = rs.getString("Device_Type");
					Integer ID = rs.getInt("Device_ID");
					String modifiedBy = rs.getString("Modified_By");
					OffsetDateTime modifiedAt = rs.getObject("Modified_At", OffsetDateTime.class);
					String changeType = rs.getString("Change_Type");
					LocalDate oldAcquisitionDate = rs.getObject("Old_Acquisition_Date", LocalDate.class);
					LocalDate newAcquisitionDate = rs.getObject("New_Acquisition_Date", LocalDate.class);
					Double oldValue = rs.getDouble("Old_Value");
					if (rs.wasNull())
						oldValue = null;
					Double newValue = rs.getDouble("New_Value");
					if (rs.wasNull())
						newValue = null;
					Integer oldChapterID = rs.getInt("Old_Chapter_ID");
					if (rs.wasNull())
						oldChapterID = null;
					Integer newChapterID = rs.getInt("New_Chapter_ID");
					if (rs.wasNull())
						newChapterID = null;
					Integer oldDonorID = rs.getInt("Old_Donor_ID");
					if (rs.wasNull())
						oldDonorID = null;
					Integer newDonorID = rs.getInt("New_Donor_ID");
					if (rs.wasNull())
						newDonorID = null;
					String oldManf = rs.getString("Old_Manufacturer");
					String newManf = rs.getString("New_Manufacturer");
					String oldModel = rs.getString("Old_Model");
					String newModel = rs.getString("New_Model");
					Integer oldYear = rs.getInt("Old_Year");
					if (rs.wasNull())
						oldYear = null;
					Integer newYear = rs.getInt("New_Year");
					if (rs.wasNull())
						newYear = null;
					String oldCPU = rs.getString("Old_CPU");
					String newCPU = rs.getString("New_CPU");
					Integer oldRam = rs.getInt("Old_RAM");
					if (rs.wasNull())
						oldRam = null;
					Integer newRam = rs.getInt("New_RAM");
					if (rs.wasNull())
						newRam = null;
					String oldRamGeneration = rs.getString("Old_RAM_Generation");
					String newRamGeneration = rs.getString("New_RAM_Generation");
					Integer oldStorageAmount = rs.getInt("Old_Storage_Amount");
					if (rs.wasNull())
						oldStorageAmount = null;
					Integer newStorageAmount = rs.getInt("New_Storage_Amount");
					if (rs.wasNull())
						newStorageAmount = null;
					String oldStorageType = rs.getString("Old_Storage_Type");
					String newStorageType = rs.getString("New_Storage_Type");
					String oldStatus = rs.getString("Old_Status");
					String newStatus = rs.getString("New_Status");
					Boolean oldHasWifi = rs.getBoolean("Old_HasWifi");
					if (rs.wasNull())
						oldHasWifi = null;
					Boolean newHasWifi = rs.getBoolean("New_HasWifi");
					if (rs.wasNull())
						newHasWifi = null;
					String oldIncludesCharger = rs.getString("Old_Includes_Charger");
					String newIncludesCharger = rs.getString("New_Includes_Charger");
					Integer oldDesignCap = rs.getInt("Old_Design_Capacity");
					if (rs.wasNull())
						oldDesignCap = null;
					Integer newDesignCap = rs.getInt("New_Design_Capacity");
					if (rs.wasNull())
						newDesignCap = null;
					Integer oldActualCap = rs.getInt("Old_Actual_Capacity");
					if (rs.wasNull())
						oldActualCap = null;
					Integer newActualCap = rs.getInt("New_Actual_Capacity");
					if (rs.wasNull())
						newActualCap = null;
					Double oldBatteryHealth = rs.getDouble("Old_Battery_Health");
					if (rs.wasNull())
						oldBatteryHealth = null;
					Double newBatteryHealth = rs.getDouble("New_Battery_Health");
					if (rs.wasNull())
						newBatteryHealth = null;
					String oldWorkingBattery = rs.getString("Old_Working_Battery");
					String newWorkingBattery = rs.getString("New_Working_Battery");
					LocalDate oldDonatedDate = rs.getObject("Old_Donated_Date", LocalDate.class);
					LocalDate newDonatedDate = rs.getObject("New_Donated_Date", LocalDate.class);
					String oldOS = rs.getString("Old_Operating_System");
					String newOS = rs.getString("New_Operating_System");
					Integer oldRecipientID = rs.getInt("Old_Recipient_ID");
					if (rs.wasNull())
						oldRecipientID = null;
					Integer newRecipientID = rs.getInt("New_Recipient_ID");
					if (rs.wasNull())
						newRecipientID = null;
					entries.add(new DeviceChangelogResponse(deviceType, ID, modifiedBy, modifiedAt, changeType,
						oldAcquisitionDate, newAcquisitionDate, oldValue, newValue, oldChapterID, newChapterID,
						oldDonorID, newDonorID, oldManf, newManf, oldModel, newModel, oldYear, newYear, oldCPU, newCPU,
						oldRam, newRam, oldRamGeneration, newRamGeneration, oldStorageAmount, newStorageAmount,
						oldStorageType, newStorageType, oldStatus, newStatus, oldHasWifi, newHasWifi,
						oldIncludesCharger, newIncludesCharger, oldDesignCap, newDesignCap, oldActualCap, newActualCap,
						oldBatteryHealth, newBatteryHealth, oldWorkingBattery, newWorkingBattery, oldDonatedDate,
						newDonatedDate, oldOS, newOS, oldRecipientID, newRecipientID));
				}
				return entries.toArray(new DeviceChangelogResponse[0]);
			}
		}
	}
}
