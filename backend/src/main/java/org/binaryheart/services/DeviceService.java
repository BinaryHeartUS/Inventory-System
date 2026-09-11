package org.binaryheart.services;

import com.google.inject.Inject;
import java.security.InvalidParameterException;
import java.sql.SQLException;
import java.util.List;
import org.binaryheart.exceptions.DeviceNotFoundException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.ForbiddenException;
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

	private final DeviceRepository repository;
	private final ChapterService chapterService;

	@Inject
	public DeviceService(DeviceRepository repository, ChapterService chapterService) {
		this.repository = repository;
		this.chapterService = chapterService;
	}

	public int getDeviceCount(String type, String status, List<Integer> requestedChapterIds,
		List<Integer> userChapterIds) throws ForbiddenException, SQLException {
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
		int months) throws ForbiddenException, SQLException {
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(requestedChapterIds, userChapterIds);
		return repository.getDevicesReceived(effectiveChapterIds, months);
	}

	public List<MonthlyCountPoint> getDevicesDonated(List<Integer> requestedChapterIds, List<Integer> userChapterIds,
		int months) throws ForbiddenException, SQLException {
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(requestedChapterIds, userChapterIds);
		return repository.getDevicesDonated(effectiveChapterIds, months);
	}

	public List<MonthlyValuePoint> getDonatedDeviceValue(List<Integer> requestedChapterIds,
		List<Integer> userChapterIds, int months) throws ForbiddenException, SQLException {
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(requestedChapterIds, userChapterIds);
		return repository.getDonatedDeviceValue(effectiveChapterIds, months);
	}

	public GetDeviceResponse getDevice(int id) throws DeviceNotFoundException, SQLException {
		return repository.getDevice(id);
	}

	public void deleteDevice(int id, String username) throws DeviceNotFoundException, SQLException {
		try {
			repository.deleteDevice(id, username);
		} catch (SQLException e) {
			if ("02000".equals(e.getSQLState())) {
				throw new DeviceNotFoundException("Could not find device with specified ID: " + id);
			}
			throw e;
		}
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

	public int insertDesktop(InsertDesktopRequest request, String username) throws DuplicateKeyException, SQLException {
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

	public int insertLaptop(InsertLaptopRequest request, String username) throws DuplicateKeyException, SQLException {
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

	public int insertTablet(InsertTabletRequest request, String username) throws DuplicateKeyException, SQLException {
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
		throws DeviceNotFoundException, SQLException {
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
		throws DeviceNotFoundException, SQLException {
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
		throws DeviceNotFoundException, SQLException {
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
		throws SQLException, InvalidParameterException {
		GetDeviceResponse device = repository.getDevice(deviceID);
		Integer chapterID = chapterService.getChapterIdByName(device.chapter());
		if (device == null || (!userChapterIds.contains(chapterID)
			&& !userChapterIds.contains(chapterService.getNationalChapterId()))) {
			throw new InvalidParameterException("Device not found");
		}

		return repository.getDeviceChangelog(deviceID);
	}
}
