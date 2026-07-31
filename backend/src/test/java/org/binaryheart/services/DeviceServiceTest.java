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
	void everyStatisticDelegatesWithResolvedChapters() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		List<Integer> requested = List.of(2);
		List<Integer> userChapters = List.of(1, 2);
		List<Integer> effective = List.of(2);
		expect(chapters.resolveChapterIds(requested, userChapters)).andReturn(effective).times(7);
		expect(chapters.resolveChapterIds(List.<Integer>of(), userChapters)).andReturn(effective);
		DashboardCountsResponse dashboard = new DashboardCountsResponse(1, 2, 3, 4, 5, 6, 7, 8);
		AvgTimeInInventoryResponse average = new AvgTimeInInventoryResponse(4.5, 2);
		CompletionRateResponse completion = new CompletionRateResponse(3, 4);
		ChapterActivityStatsResponse activity = new ChapterActivityStatsResponse(5, 4, 3, 2);
		List<MonthlyCountPoint> monthlyCounts = List.of(new MonthlyCountPoint(2026, 1, 2));
		List<MonthlyValuePoint> monthlyValues = List.of(new MonthlyValuePoint(2026, 1, 10.0));
		expect(repository.getDeviceCountByChapters("desktop", "active", effective)).andReturn(5);
		expect(repository.getDashboardCounts(effective)).andReturn(dashboard);
		expect(repository.getAvgTimeInInventory(effective)).andReturn(average);
		expect(repository.getCompletionRate(effective)).andReturn(completion);
		expect(repository.getChapterActivityStats(effective)).andReturn(activity);
		expect(repository.getDevicesReceived(effective, 12)).andReturn(monthlyCounts);
		expect(repository.getDevicesDonated(effective, 12)).andReturn(monthlyCounts);
		expect(repository.getDonatedDeviceValue(effective, 12)).andReturn(monthlyValues);
		replay(repository, chapters);
		DeviceService service = new DeviceService(repository, chapters);

		assertEquals(5, service.getDeviceCount("desktop", "active", requested, userChapters));
		assertSame(dashboard, service.getDashboardCounts(requested, userChapters));
		assertSame(average, service.getAvgTimeInInventory(requested, userChapters));
		assertSame(completion, service.getCompletionRate(requested, userChapters));
		assertSame(activity, service.getChapterActivityStats(userChapters));
		assertSame(monthlyCounts, service.getDevicesReceived(requested, userChapters, 12));
		assertSame(monthlyCounts, service.getDevicesDonated(requested, userChapters, 12));
		assertSame(monthlyValues, service.getDonatedDeviceValue(requested, userChapters, 12));

		verify(repository, chapters);
	}

	@Test
	void queriesDelegateAndEmptyAccessShortCircuits() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		DeviceListRequest query = new DeviceListRequest(null, null, null, false, false, null, null, null, null, 25, 0);
		GetDeviceResponse device = device();
		List<GetDeviceResponse> devices = List.of(device);
		List<ChapterInventorySummary> summary = List.of();
		expect(repository.getDevice(101)).andReturn(device);
		expect(chapters.resolveChapterIds(2, List.of(2))).andReturn(List.of(2));
		expect(repository.getDevices(List.of(2), query)).andReturn(devices);
		expect(chapters.resolveChapterIds(List.<Integer>of(), List.of(2))).andReturn(List.of(2));
		expect(repository.getChapterInventorySummary(List.of(2))).andReturn(summary);
		replay(repository, chapters);
		DeviceService service = new DeviceService(repository, chapters);

		assertSame(device, service.getDevice(101));
		assertSame(devices, service.getDevices(List.of(2), 2, query));
		assertSame(summary, service.getChapterInventorySummary(List.of(2)));
		assertEquals(List.of(), service.getDevices(List.of(), null, query));
		assertEquals(List.of(), service.getChapterInventorySummary(null));

		verify(repository, chapters);
	}

	@Test
	void everyMutationDelegates() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		expect(repository.insertDesktop(desktop(), "user")).andReturn(101);
		expect(repository.insertLaptop(laptop(), "user")).andReturn(102);
		expect(repository.insertTablet(tablet(), "user")).andReturn(103);
		repository.updateDesktop(desktop(), "user");
		repository.updateLaptop(laptop(), "user");
		repository.updateTablet(tablet(), "user");
		replay(repository, chapters);
		DeviceService service = new DeviceService(repository, chapters);

		assertEquals(101, service.insertDesktop(desktop(), "user"));
		assertEquals(102, service.insertLaptop(laptop(), "user"));
		assertEquals(103, service.insertTablet(tablet(), "user"));
		service.updateDesktop(desktop(), "user");
		service.updateLaptop(laptop(), "user");
		service.updateTablet(tablet(), "user");

		verify(repository, chapters);
	}

	@Test
	void mutationsTranslateDuplicateAndMissingSqlStates() throws Exception {
		DeviceRepository repository = mock(DeviceRepository.class);
		ChapterService chapters = mock(ChapterService.class);
		expect(repository.insertDesktop(desktop(), "user")).andThrow(sql("23505"));
		expect(repository.insertLaptop(laptop(), "user")).andThrow(sql("23505"));
		expect(repository.insertTablet(tablet(), "user")).andThrow(sql("23505"));
		repository.updateDesktop(desktop(), "user");
		expectLastCall().andThrow(sql("02000"));
		repository.updateLaptop(laptop(), "user");
		expectLastCall().andThrow(sql("02000"));
		repository.updateTablet(tablet(), "user");
		expectLastCall().andThrow(sql("02000"));
		replay(repository, chapters);
		DeviceService service = new DeviceService(repository, chapters);

		assertThrows(DuplicateKeyException.class, () -> service.insertDesktop(desktop(), "user"));
		assertThrows(DuplicateKeyException.class, () -> service.insertLaptop(laptop(), "user"));
		assertThrows(DuplicateKeyException.class, () -> service.insertTablet(tablet(), "user"));
		assertThrows(DeviceNotFoundException.class, () -> service.updateDesktop(desktop(), "user"));
		assertThrows(DeviceNotFoundException.class, () -> service.updateLaptop(laptop(), "user"));
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