package org.binaryheart.services;

import java.security.InvalidParameterException;
import java.sql.SQLException;
import java.util.List;
import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DeviceNotFoundException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.ForbiddenException;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.requests.DeviceListRequest;
import org.binaryheart.repositories.DeviceRepository;
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

public class DeviceService {

	private static final List<String> VALID_TYPES = List.of("desktop", "laptop", "tablet", "total");
	private static final List<String> VALID_STATUSES = List.of("active", "not-started", "in-progress",
		"ready-to-donate", "donated");

	private final DeviceRepository repository = new DeviceRepository();
	private final ChapterService chapterService = new ChapterService();

	public int getDeviceCount(String type, String status, List<Integer> requestedChapterIds,
		List<Integer> userChapterIds) throws BadArgumentException, ForbiddenException, SQLException {
		if (!VALID_TYPES.contains(type)) {
			throw new BadArgumentException("Unknown device type: " + type);
		}
		if (!VALID_STATUSES.contains(status)) {
			throw new BadArgumentException("Unknown status: " + status);
		}
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(requestedChapterIds, userChapterIds);
		return repository.getDeviceCountByChapters(type, status, effectiveChapterIds);
	}

	public DashboardCountsResponse getDashboardCounts(List<Integer> requestedChapterIds, List<Integer> userChapterIds)
		throws ForbiddenException, SQLException {
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(requestedChapterIds, userChapterIds);
		return repository.getDashboardCounts(effectiveChapterIds);
	}

	public AvgTimeInInventoryResponse getAvgTimeInInventory(List<Integer> requestedChapterIds,
		List<Integer> userChapterIds) throws ForbiddenException, SQLException {
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(requestedChapterIds, userChapterIds);
		return repository.getAvgTimeInInventory(effectiveChapterIds);
	}

	public CompletionRateResponse getCompletionRate(List<Integer> requestedChapterIds, List<Integer> userChapterIds)
		throws ForbiddenException, SQLException {
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(requestedChapterIds, userChapterIds);
		return repository.getCompletionRate(effectiveChapterIds);
	}

	public ChapterActivityStatsResponse getChapterActivityStats(List<Integer> userChapterIds)
		throws ForbiddenException, SQLException {
		// Chapter activity stats always use all chapters visible to the user
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(List.<Integer>of(), userChapterIds);
		return repository.getChapterActivityStats(effectiveChapterIds);
	}

	public List<MonthlyCountPoint> getDevicesReceived(List<Integer> requestedChapterIds, List<Integer> userChapterIds,
		int months) throws BadArgumentException, ForbiddenException, SQLException {
		if (months < 1 || months > 120) {
			throw new BadArgumentException("months must be between 1 and 120");
		}
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(requestedChapterIds, userChapterIds);
		return repository.getDevicesReceived(effectiveChapterIds, months);
	}

	public List<MonthlyCountPoint> getDevicesDonated(List<Integer> requestedChapterIds, List<Integer> userChapterIds,
		int months) throws BadArgumentException, ForbiddenException, SQLException {
		if (months < 1 || months > 120) {
			throw new BadArgumentException("months must be between 1 and 120");
		}
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(requestedChapterIds, userChapterIds);
		return repository.getDevicesDonated(effectiveChapterIds, months);
	}

	public List<MonthlyValuePoint> getDonatedDeviceValue(List<Integer> requestedChapterIds,
		List<Integer> userChapterIds, int months) throws BadArgumentException, ForbiddenException, SQLException {
		if (months < 1 || months > 120) {
			throw new BadArgumentException("months must be between 1 and 120");
		}
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(requestedChapterIds, userChapterIds);
		return repository.getDonatedDeviceValue(effectiveChapterIds, months);
	}

	public GetDeviceResponse getDevice(int id) throws BadArgumentException, DeviceNotFoundException, SQLException {
		if (id <= 0) {
			throw new BadArgumentException("Device ID must be positive");
		}
		return repository.getDevice(id);
	}

	/**
	 * Returns a page of devices scoped to the caller's chapters
	 * ({@code userChapterIds}), optionally narrowed to one {@code chapterId} (the
	 * UI filter, {@code null} for all).
	 */
	public List<GetDeviceResponse> getDevices(List<Integer> userChapterIds, Integer chapterId, DeviceListRequest q)
		throws SQLException, ForbiddenException {
		if (userChapterIds == null || userChapterIds.isEmpty())
			return List.of();
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(chapterId, userChapterIds);
		return repository.getDevices(effectiveChapterIds, q);
	}

	public List<ChapterInventorySummary> getChapterInventorySummary(List<Integer> userChapterIds)
		throws SQLException, ForbiddenException {
		if (userChapterIds == null || userChapterIds.isEmpty())
			return List.of();
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(List.of(), userChapterIds);
		return repository.getChapterInventorySummary(effectiveChapterIds);
	}

	public int insertDesktop(InsertDesktopRequest request, String username)
		throws MissingRequiredParametersException, BadArgumentException, DuplicateKeyException, SQLException {
		if (request.chapterId() == 0 || request.manufacturer() == null || request.manufacturer().strip().equals("")
			|| request.model() == null || request.year() == 0 || request.status() == null) {
			throw new MissingRequiredParametersException("Missing required parameters");
		}
		if (request.ram() != null && request.ram() <= 0) {
			throw new BadArgumentException("RAM amount must be positive or not specified");
		}
		if (request.storageAmount() != null && request.storageAmount() <= 0) {
			throw new BadArgumentException("Storage amount must be positive or not specified");
		}
		if (request.value() != null && request.value() < 0) {
			throw new BadArgumentException("Value must be non-negative or not specified");
		}
		if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
			throw new BadArgumentException("Acquisition date cannot be in the future");
		}
		if (request.assetId() != null && request.assetId() <= 0) {
			throw new BadArgumentException("Asset ID must be positive or not specified");
		}
		try {
			return repository.insertDesktop(request, username);
		} catch (SQLException e) {
			if ("23505".equals(e.getSQLState())) {
				throw new DuplicateKeyException("An asset with the same asset ID already exists: " + request.assetId());
			} else {
				throw e;
			}
		}
	}

	public int insertLaptop(InsertLaptopRequest request, String username)
		throws MissingRequiredParametersException, BadArgumentException, DuplicateKeyException, SQLException {
		if (request.chapterId() == 0 || request.manufacturer() == null || request.manufacturer().strip().equals("")
			|| request.model() == null || request.year() == 0 || request.status() == null
			|| request.includesCharger() == null) {
			throw new MissingRequiredParametersException("Missing required parameters");
		}
		if (request.ram() != null && request.ram() <= 0) {
			throw new BadArgumentException("RAM amount must be positive or not specified");
		}
		if (request.storageAmount() != null && request.storageAmount() <= 0) {
			throw new BadArgumentException("Storage amount must be positive or not specified");
		}
		if (request.value() != null && request.value() < 0) {
			throw new BadArgumentException("Value must be non-negative or not specified");
		}
		if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
			throw new BadArgumentException("Acquisition date cannot be in the future");
		}
		if (request.assetId() != null && request.assetId() <= 0) {
			throw new BadArgumentException("Asset ID must be positive or not specified");
		}
		if (request.designBatteryCapacity() != null && request.designBatteryCapacity() <= 0) {
			throw new BadArgumentException("Design battery capacity must be positive or not specified");
		}
		if (request.actualBatteryCapacity() != null && request.actualBatteryCapacity() < 0) {
			throw new BadArgumentException("Actual battery capacity must be non-negative or not specified");
		}
		try {
			return repository.insertLaptop(request, username);
		} catch (SQLException e) {
			if ("23505".equals(e.getSQLState())) {
				throw new DuplicateKeyException("An asset with the same asset ID already exists: " + request.assetId());
			} else {
				throw e;
			}
		}
	}

	public int insertTablet(InsertTabletRequest request, String username)
		throws MissingRequiredParametersException, BadArgumentException, DuplicateKeyException, SQLException {
		if (request.chapterId() == 0 || request.manufacturer() == null || request.manufacturer().strip().equals("")
			|| request.model() == null || request.year() == 0 || request.status() == null
			|| request.includesCharger() == null || request.workingBattery() == null) {
			throw new MissingRequiredParametersException("Missing required parameters");
		}
		if (request.ram() != null && request.ram() <= 0) {
			throw new BadArgumentException("RAM amount must be positive or not specified");
		}
		if (request.storageAmount() != null && request.storageAmount() <= 0) {
			throw new BadArgumentException("Storage amount must be positive or not specified");
		}
		if (request.value() != null && request.value() < 0) {
			throw new BadArgumentException("Value must be non-negative or not specified");
		}
		if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
			throw new BadArgumentException("Acquisition date cannot be in the future");
		}
		if (request.assetId() != null && request.assetId() <= 0) {
			throw new BadArgumentException("Asset ID must be positive or not specified");
		}
		try {
			return repository.insertTablet(request, username);
		} catch (SQLException e) {
			if ("23505".equals(e.getSQLState())) {
				throw new DuplicateKeyException("An asset with the same asset ID already exists: " + request.assetId());
			} else {
				throw e;
			}
		}
	}

	public void updateDesktop(InsertDesktopRequest request, String username)
		throws MissingRequiredParametersException, BadArgumentException, DeviceNotFoundException, SQLException {
		if (request.chapterId() == 0 || request.manufacturer() == null || request.manufacturer().strip().equals("")
			|| request.model() == null || request.year() == 0 || request.status() == null
			|| request.assetId() == null) {
			throw new MissingRequiredParametersException("Missing required parameters");
		}
		if (request.ram() != null && request.ram() <= 0) {
			throw new BadArgumentException("RAM amount must be positive or not specified");
		}
		if (request.storageAmount() != null && request.storageAmount() <= 0) {
			throw new BadArgumentException("Storage amount must be positive or not specified");
		}
		if (request.value() != null && request.value() < 0) {
			throw new BadArgumentException("Value must be non-negative or not specified");
		}
		if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
			throw new BadArgumentException("Acquisition date cannot be in the future");
		}
		if (request.assetId() <= 0) {
			throw new BadArgumentException("Asset ID must be positive");
		}
		try {
			repository.updateDesktop(request, username);
		} catch (SQLException e) {
			if ("02000".equals(e.getSQLState())) {
				throw new DeviceNotFoundException("Could not find desktop with specified ID: " + request.assetId());
			} else {
				throw e;
			}
		}
	}

	public void updateLaptop(InsertLaptopRequest request, String username)
		throws MissingRequiredParametersException, BadArgumentException, DeviceNotFoundException, SQLException {
		if (request.chapterId() == 0 || request.manufacturer() == null || request.manufacturer().strip().equals("")
			|| request.model() == null || request.year() == 0 || request.status() == null
			|| request.includesCharger() == null || request.assetId() == null) {
			throw new MissingRequiredParametersException("Missing required parameters");
		}
		if (request.ram() != null && request.ram() <= 0) {
			throw new BadArgumentException("RAM amount must be positive or not specified");
		}
		if (request.storageAmount() != null && request.storageAmount() <= 0) {
			throw new BadArgumentException("Storage amount must be positive or not specified");
		}
		if (request.value() != null && request.value() < 0) {
			throw new BadArgumentException("Value must be non-negative or not specified");
		}
		if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
			throw new BadArgumentException("Acquisition date cannot be in the future");
		}
		if (request.assetId() <= 0) {
			throw new BadArgumentException("Asset ID must be positive");
		}
		if (request.designBatteryCapacity() != null && request.designBatteryCapacity() < 0) {
			throw new BadArgumentException("Design battery capacity must be non-negative or not specified");
		}
		if (request.actualBatteryCapacity() != null && request.actualBatteryCapacity() < 0) {
			throw new BadArgumentException("Actual battery capacity must be non-negative or not specified");
		}
		try {
			repository.updateLaptop(request, username);
		} catch (SQLException e) {
			if ("02000".equals(e.getSQLState())) {
				throw new DeviceNotFoundException("Could not find laptop with specified ID: " + request.assetId());
			} else {
				throw e;
			}
		}
	}

	public void updateTablet(InsertTabletRequest request, String username)
		throws MissingRequiredParametersException, BadArgumentException, DeviceNotFoundException, SQLException {
		if (request.chapterId() == 0 || request.manufacturer() == null || request.manufacturer().strip().equals("")
			|| request.model() == null || request.year() == 0 || request.status() == null
			|| request.includesCharger() == null || request.workingBattery() == null || request.assetId() == null) {
			throw new MissingRequiredParametersException("Missing required parameters");
		}
		if (request.ram() != null && request.ram() <= 0) {
			throw new BadArgumentException("RAM amount must be positive or not specified");
		}
		if (request.storageAmount() != null && request.storageAmount() <= 0) {
			throw new BadArgumentException("Storage amount must be positive or not specified");
		}
		if (request.value() != null && request.value() < 0) {
			throw new BadArgumentException("Value must be non-negative or not specified");
		}
		if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
			throw new BadArgumentException("Acquisition date cannot be in the future");
		}
		if (request.assetId() <= 0) {
			throw new BadArgumentException("Asset ID must be positive");
		}
		try {
			repository.updateTablet(request, username);
		} catch (SQLException e) {
			if ("02000".equals(e.getSQLState())) {
				throw new DeviceNotFoundException("Could not find tablet with specified ID: " + request.assetId());
			} else {
				throw e;
			}
		}
	}

	public DeviceChangelogResponse[] getDeviceChangelog(List<Integer> userChapterIds, Integer deviceID)
		throws SQLException, MissingRequiredParametersException, InvalidParameterException {
		if (deviceID == null || deviceID <= 0)
			throw new MissingRequiredParametersException(
				"Non-numeric or non-positive device ID provided, must be a positive integer");

		GetDeviceResponse device = repository.getDevice(deviceID);
		Integer chapterID = chapterService.getChapterIdByName(device.chapter());
		if (device == null || (!userChapterIds.contains(chapterID)
			&& !userChapterIds.contains(chapterService.getNationalChapterId()))) {
			throw new InvalidParameterException("Device not found");
		}

		return repository.getDeviceChangelog(deviceID);
	}
}
