package org.binaryheart.services;

import static org.binaryheart.TestFixtures.desktop;
import static org.binaryheart.TestFixtures.device;
import static org.binaryheart.TestFixtures.laptop;
import static org.binaryheart.TestFixtures.tablet;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.sql.SQLException;
import java.util.List;
import org.binaryheart.exceptions.DeviceNotFoundException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.repositories.DeviceRepository;
import org.binaryheart.requests.DeviceListRequest;
import org.binaryheart.responses.AvgTimeInInventoryResponse;
import org.binaryheart.responses.ChapterActivityStatsResponse;
import org.binaryheart.responses.ChapterInventorySummary;
import org.binaryheart.responses.CompletionRateResponse;
import org.binaryheart.responses.DashboardCountsResponse;
import org.binaryheart.responses.DeviceChangelogResponse;
import org.binaryheart.responses.GetDeviceResponse;
import org.binaryheart.responses.MonthlyCountPoint;
import org.binaryheart.responses.MonthlyValuePoint;
import org.junit.jupiter.api.Test;

class DeviceServiceTest {

	@Test
	void getDeviceCountDelegatesWithResolvedChapters() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		List<Integer> requested = List.of(2);
		List<Integer> userChapters = List.of(1, 2);
		List<Integer> effective = List.of(2);
		expect(chapters.resolveChapterIds(requested, userChapters)).andReturn(effective);
		expect(repository.getDeviceCountByChapters("desktop", "active", effective)).andReturn(5);
		replay(repository, chapters);

		assertEquals(5,
			new DeviceService(repository, chapters).getDeviceCount("desktop", "active", requested, userChapters));

		verify(repository, chapters);
	}

	@Test
	void getDashboardCountsDelegatesWithResolvedChapters() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		DashboardCountsResponse response = new DashboardCountsResponse(1, 2, 3, 4, 5, 6, 7, 8, 9);
		expect(chapters.resolveChapterIds(List.of(2), List.of(1, 2))).andReturn(List.of(2));
		expect(repository.getDashboardCounts(List.of(2))).andReturn(response);
		replay(repository, chapters);

		assertSame(response, new DeviceService(repository, chapters).getDashboardCounts(List.of(2), List.of(1, 2)));

		verify(repository, chapters);
	}

	@Test
	void getAvgTimeInInventoryDelegatesWithResolvedChapters() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		AvgTimeInInventoryResponse response = new AvgTimeInInventoryResponse(4.5, 2);
		expect(chapters.resolveChapterIds(List.of(2), List.of(1, 2))).andReturn(List.of(2));
		expect(repository.getAvgTimeInInventory(List.of(2))).andReturn(response);
		replay(repository, chapters);

		assertSame(response, new DeviceService(repository, chapters).getAvgTimeInInventory(List.of(2), List.of(1, 2)));

		verify(repository, chapters);
	}

	@Test
	void getCompletionRateDelegatesWithResolvedChapters() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		CompletionRateResponse response = new CompletionRateResponse(3, 4);
		expect(chapters.resolveChapterIds(List.of(2), List.of(1, 2))).andReturn(List.of(2));
		expect(repository.getCompletionRate(List.of(2))).andReturn(response);
		replay(repository, chapters);

		assertSame(response, new DeviceService(repository, chapters).getCompletionRate(List.of(2), List.of(1, 2)));

		verify(repository, chapters);
	}

	@Test
	void getChapterActivityStatsDelegatesWithResolvedChapters() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		ChapterActivityStatsResponse response = new ChapterActivityStatsResponse(5, 4, 3, 2);
		expect(chapters.resolveChapterIds(List.<Integer>of(), List.of(1, 2))).andReturn(List.of(2));
		expect(repository.getChapterActivityStats(List.of(2))).andReturn(response);
		replay(repository, chapters);

		assertSame(response, new DeviceService(repository, chapters).getChapterActivityStats(List.of(1, 2)));

		verify(repository, chapters);
	}

	@Test
	void getDevicesReceivedDelegatesWithResolvedChapters() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		List<MonthlyCountPoint> response = List.of(new MonthlyCountPoint(2026, 1, 2));
		expect(chapters.resolveChapterIds(List.of(2), List.of(1, 2))).andReturn(List.of(2));
		expect(repository.getDevicesReceived(List.of(2), 12)).andReturn(response);
		replay(repository, chapters);

		assertSame(response, new DeviceService(repository, chapters).getDevicesReceived(List.of(2), List.of(1, 2), 12));

		verify(repository, chapters);
	}

	@Test
	void getDevicesDonatedDelegatesWithResolvedChapters() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		List<MonthlyCountPoint> response = List.of(new MonthlyCountPoint(2026, 1, 2));
		expect(chapters.resolveChapterIds(List.of(2), List.of(1, 2))).andReturn(List.of(2));
		expect(repository.getDevicesDonated(List.of(2), 12)).andReturn(response);
		replay(repository, chapters);

		assertSame(response, new DeviceService(repository, chapters).getDevicesDonated(List.of(2), List.of(1, 2), 12));

		verify(repository, chapters);
	}

	@Test
	void getDonatedDeviceValueDelegatesWithResolvedChapters() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		List<MonthlyValuePoint> response = List.of(new MonthlyValuePoint(2026, 1, 10.0));
		expect(chapters.resolveChapterIds(List.of(2), List.of(1, 2))).andReturn(List.of(2));
		expect(repository.getDonatedDeviceValue(List.of(2), 12)).andReturn(response);
		replay(repository, chapters);

		assertSame(response,
			new DeviceService(repository, chapters).getDonatedDeviceValue(List.of(2), List.of(1, 2), 12));

		verify(repository, chapters);
	}

	@Test
	void getDeviceDelegates() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		GetDeviceResponse response = device();
		expect(repository.getDevice(101)).andReturn(response);
		replay(repository, chapters);

		assertSame(response, new DeviceService(repository, chapters).getDevice(101));

		verify(repository, chapters);
	}

	@Test
	void getDevicesDelegatesWithResolvedChapter() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		DeviceListRequest query = new DeviceListRequest(null, null, null, false, false, false, null, null, null, null,
			25, 0);
		List<GetDeviceResponse> response = List.of(device());
		expect(chapters.resolveChapterIds(2, List.of(2))).andReturn(List.of(2));
		expect(repository.getDevices(List.of(2), query)).andReturn(response);
		replay(repository, chapters);

		assertSame(response, new DeviceService(repository, chapters).getDevices(List.of(2), 2, query));

		verify(repository, chapters);
	}

	@Test
	void getDevicesShortCircuitsEmptyAccess() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		DeviceListRequest query = new DeviceListRequest(null, null, null, false, false, false, null, null, null, null,
			25, 0);
		replay(repository, chapters);

		assertEquals(List.of(), new DeviceService(repository, chapters).getDevices(List.of(), null, query));

		verify(repository, chapters);
	}

	@Test
	void getChapterInventorySummaryDelegatesWithResolvedChapters() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		List<ChapterInventorySummary> response = List.of();
		expect(chapters.resolveChapterIds(List.<Integer>of(), List.of(2))).andReturn(List.of(2));
		expect(repository.getChapterInventorySummary(List.of(2))).andReturn(response);
		replay(repository, chapters);

		assertSame(response, new DeviceService(repository, chapters).getChapterInventorySummary(List.of(2)));

		verify(repository, chapters);
	}

	@Test
	void getChapterInventorySummaryShortCircuitsNullAccess() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		replay(repository, chapters);

		assertEquals(List.of(), new DeviceService(repository, chapters).getChapterInventorySummary(null));

		verify(repository, chapters);
	}

	@Test
	void insertDesktopDelegates() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		expect(repository.insertDesktop(desktop(), "user")).andReturn(101);
		replay(repository, chapters);

		assertEquals(101, new DeviceService(repository, chapters).insertDesktop(desktop(), "user"));

		verify(repository, chapters);
	}

	@Test
	void insertLaptopDelegates() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		expect(repository.insertLaptop(laptop(), "user")).andReturn(102);
		replay(repository, chapters);

		assertEquals(102, new DeviceService(repository, chapters).insertLaptop(laptop(), "user"));

		verify(repository, chapters);
	}

	@Test
	void insertTabletDelegates() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		expect(repository.insertTablet(tablet(), "user")).andReturn(103);
		replay(repository, chapters);

		assertEquals(103, new DeviceService(repository, chapters).insertTablet(tablet(), "user"));

		verify(repository, chapters);
	}

	@Test
	void updateDesktopDelegates() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		repository.updateDesktop(desktop(), "user");
		replay(repository, chapters);

		new DeviceService(repository, chapters).updateDesktop(desktop(), "user");

		verify(repository, chapters);
	}

	@Test
	void updateLaptopDelegates() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		repository.updateLaptop(laptop(), "user");
		replay(repository, chapters);

		new DeviceService(repository, chapters).updateLaptop(laptop(), "user");

		verify(repository, chapters);
	}

	@Test
	void updateTabletDelegates() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		repository.updateTablet(tablet(), "user");
		replay(repository, chapters);

		new DeviceService(repository, chapters).updateTablet(tablet(), "user");

		verify(repository, chapters);
	}

	@Test
	void insertDesktopTranslatesDuplicateSqlState() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		expect(repository.insertDesktop(desktop(), "user")).andThrow(sql("23505"));
		replay(repository, chapters);
		DeviceService service = new DeviceService(repository, chapters);

		assertThrows(DuplicateKeyException.class, () -> service.insertDesktop(desktop(), "user"));

		verify(repository, chapters);
	}

	@Test
	void insertLaptopTranslatesDuplicateSqlState() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		expect(repository.insertLaptop(laptop(), "user")).andThrow(sql("23505"));
		replay(repository, chapters);
		DeviceService service = new DeviceService(repository, chapters);

		assertThrows(DuplicateKeyException.class, () -> service.insertLaptop(laptop(), "user"));

		verify(repository, chapters);
	}

	@Test
	void insertTabletTranslatesDuplicateSqlState() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		expect(repository.insertTablet(tablet(), "user")).andThrow(sql("23505"));
		replay(repository, chapters);
		DeviceService service = new DeviceService(repository, chapters);

		assertThrows(DuplicateKeyException.class, () -> service.insertTablet(tablet(), "user"));

		verify(repository, chapters);
	}

	@Test
	void updateDesktopTranslatesMissingSqlState() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		repository.updateDesktop(desktop(), "user");
		expectLastCall().andThrow(sql("02000"));
		replay(repository, chapters);
		DeviceService service = new DeviceService(repository, chapters);

		assertThrows(DeviceNotFoundException.class, () -> service.updateDesktop(desktop(), "user"));

		verify(repository, chapters);
	}

	@Test
	void updateLaptopTranslatesMissingSqlState() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		repository.updateLaptop(laptop(), "user");
		expectLastCall().andThrow(sql("02000"));
		replay(repository, chapters);
		DeviceService service = new DeviceService(repository, chapters);

		assertThrows(DeviceNotFoundException.class, () -> service.updateLaptop(laptop(), "user"));

		verify(repository, chapters);
	}

	@Test
	void updateTabletTranslatesMissingSqlState() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		repository.updateTablet(tablet(), "user");
		expectLastCall().andThrow(sql("02000"));
		replay(repository, chapters);
		DeviceService service = new DeviceService(repository, chapters);

		assertThrows(DeviceNotFoundException.class, () -> service.updateTablet(tablet(), "user"));

		verify(repository, chapters);
	}

	@Test
	void changelogChecksChapterAccessBeforeDelegating() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		GetDeviceResponse device = device();
		DeviceChangelogResponse[] changelog = new DeviceChangelogResponse[0];
		expect(repository.getDevice(101)).andReturn(device);
		expect(chapters.getChapterIdByName("Chapter Two")).andReturn(2);
		expect(repository.getDeviceChangelog(101)).andReturn(changelog);
		replay(repository, chapters);
		DeviceService service = new DeviceService(repository, chapters);

		assertSame(changelog, service.getDeviceChangelog(List.of(2), 101));

		verify(repository, chapters);
	}

	private SQLException sql(String state) {
		return new SQLException("failure", state);
	}
}