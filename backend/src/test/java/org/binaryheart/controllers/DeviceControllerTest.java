package org.binaryheart.controllers;

import static org.binaryheart.TestFixtures.desktop;
import static org.binaryheart.TestFixtures.device;
import static org.binaryheart.TestFixtures.laptop;
import static org.binaryheart.TestFixtures.tablet;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import io.javalin.Javalin;
import io.javalin.http.Context;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;
import org.binaryheart.models.ChapterRole;
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
import org.binaryheart.responses.IdResponse;
import org.binaryheart.responses.MonthlyCountPoint;
import org.binaryheart.responses.MonthlyValuePoint;
import org.binaryheart.services.AuthorizationService;
import org.binaryheart.services.ChapterService;
import org.binaryheart.services.DeviceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class DeviceControllerTest {
	private static final List<ChapterRole> CHAPTER_ROLES = List.of(new ChapterRole(2, "Editor"));

	@Test
	void registerRoutesDefinesEndpoints() {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		replay(service, chapters, authorization);

		assertDoesNotThrow(() -> Javalin.create(config -> config.routes
			.apiBuilder(new DeviceController(service, chapters, authorization)::registerRoutes)));

		verify(service, chapters, authorization);
	}

	@Test
	void deviceCountRejectsUnknownTypeBeforeService() {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("type")).andReturn("phone");
		expect(context.queryParam("status")).andReturn(null);
		expectResult(context, 400, "Unknown device type: phone");
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDeviceCount(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void deviceCountRejectsUnknownStatusBeforeService() {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("type")).andReturn("desktop");
		expect(context.queryParam("status")).andReturn("unknown").times(2);
		expectResult(context, 400, "Unknown status: unknown");
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDeviceCount(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void deviceCountParsesChaptersAndDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("type")).andReturn("DESKTOP");
		expect(context.queryParam("status")).andReturn("ACTIVE").times(2);
		expect(context.queryParam("chapters")).andReturn("2, 3");
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(1, 2, 3));
		expect(service.getDeviceCount("desktop", "active", List.of(2, 3), List.of(1, 2, 3))).andReturn(4);
		expectJson(context, 200, 4);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDeviceCount(context);
		verify(service, chapters, authorization, context);
	}

	@ParameterizedTest
	@MethodSource("invalidMonths")
	void monthlyStatsRejectInvalidMonths(String raw, String message) {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.queryParam("months")).andReturn(raw);
		expectResult(context, 400, message);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDevicesReceived(context);
		verify(service, chapters, authorization, context);
	}

	@Test
	void monthlyStatsUseDefaultMonthsAndDelegate() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		List<MonthlyCountPoint> points = List.of(new MonthlyCountPoint(2026, 1, 2));
		expect(context.queryParam("months")).andReturn(null);
		expect(context.queryParam("chapters")).andReturn(null);
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(service.getDevicesReceived(List.of(), List.of(2), 12)).andReturn(points);
		expectJson(context, 200, points);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDevicesReceived(context);
		verify(service, chapters, authorization, context);
	}

	@Test
	void deviceListBuildsExactQueryRequest() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(context.queryParam("pageSize")).andReturn("25");
		expect(context.queryParam("pageKey")).andReturn("2");
		expect(context.queryParam("chapter")).andReturn("2");
		expect(context.queryParam("search")).andReturn("Dell");
		expect(context.queryParam("type")).andReturn("desktop");
		expect(context.queryParam("status")).andReturn("active");
		expect(context.queryParam("includeDonated")).andReturn("true");
		expect(context.queryParam("includeScrapped")).andReturn("false");
		expect(context.queryParam("donorId")).andReturn("9");
		expect(context.queryParam("recipientId")).andReturn("10");
		expect(context.queryParam("sort")).andReturn("id");
		expect(context.queryParam("dir")).andReturn("desc");
		DeviceListRequest query = new DeviceListRequest("Dell", "desktop", "active", true, false, 9, 10, "id", "desc",
			25, 50);
		expect(service.getDevices(List.of(2), 2, query)).andReturn(List.of());
		expectJson(context, 200, new GetDeviceResponse[0]);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getAllDevices(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void dashboardCountsDelegate() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = chapterStatsContext();
		DashboardCountsResponse dashboard = new DashboardCountsResponse(1, 2, 3, 4, 5, 6, 7, 8);
		expect(service.getDashboardCounts(List.of(2), List.of(2))).andReturn(dashboard);
		expectJson(context, 200, dashboard);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDashboardCounts(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void averageTimeInInventoryDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = chapterStatsContext();
		AvgTimeInInventoryResponse average = new AvgTimeInInventoryResponse(4.0, 2);
		expect(service.getAvgTimeInInventory(List.of(2), List.of(2))).andReturn(average);
		expectJson(context, 200, average);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getAvgTimeInInventory(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void completionRateDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = chapterStatsContext();
		CompletionRateResponse completion = new CompletionRateResponse(3, 4);
		expect(service.getCompletionRate(List.of(2), List.of(2))).andReturn(completion);
		expectJson(context, 200, completion);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getCompletionRate(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void chapterActivityStatsDelegate() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		ChapterActivityStatsResponse activity = new ChapterActivityStatsResponse(4, 3, 2, 1);
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(service.getChapterActivityStats(List.of(2))).andReturn(activity);
		expectJson(context, 200, activity);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getChapterActivityStats(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void devicesDonatedDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = monthlyStatsContext();
		List<MonthlyCountPoint> donated = List.of(new MonthlyCountPoint(2026, 1, 2));
		expect(service.getDevicesDonated(List.of(2), List.of(2), 6)).andReturn(donated);
		expectJson(context, 200, donated);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDevicesDonated(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void donatedDeviceValueDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = monthlyStatsContext();
		List<MonthlyValuePoint> values = List.of(new MonthlyValuePoint(2026, 1, 20.0));
		expect(service.getDonatedDeviceValue(List.of(2), List.of(2), 6)).andReturn(values);
		expectJson(context, 200, values);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDonatedDeviceValue(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void chapterInventorySummaryDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		List<ChapterInventorySummary> summary = List.of();
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(service.getChapterInventorySummary(List.of(2))).andReturn(summary);
		expectJson(context, 200, summary);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getChapterInventorySummary(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void malformedChapterFilterIsRejectedBeforeService() {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.queryParam("chapters")).andReturn("2,bad");
		expectResult(context, 400, "Invalid chapter ID in 'chapters' parameter: 2,bad");
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDashboardCounts(context);
		verify(service, chapters, authorization, context);
	}

	@Test
	void getDeviceRejectsMalformedId() {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("bad");
		expectResult(context, 400, "Non-numeric device ID: bad");
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDevice(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void getDeviceRejectsNonPositiveId() {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.pathParam("id")).andReturn("0");
		expectResult(context, 400, "Device ID must be positive");
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDevice(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void getDeviceRequiresReadAuthorizationBeforeResponding() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		GetDeviceResponse device = device();
		expect(context.pathParam("id")).andReturn("101");
		expect(service.getDevice(101)).andReturn(device);
		expect(chapters.getChapterIdByName("Chapter Two")).andReturn(2);
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(CHAPTER_ROLES);
		authorization.requireChapterReadAccess(CHAPTER_ROLES, 2);
		expectJson(context, 200, device);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDevice(context);
		verify(service, chapters, authorization, context);
	}

	@ParameterizedTest
	@MethodSource("invalidDesktops")
	void desktopInsertCoversAllCommonValidation(InsertDesktopRequest request, String message) {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertDesktopRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).insertDesktop(context);
		verify(service, chapters, authorization, context);
	}

	@ParameterizedTest
	@MethodSource("invalidLaptopInserts")
	void laptopInsertValidationCoversRequiredAndBatteryRules(InsertLaptopRequest request, String message) {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertLaptopRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).insertLaptop(context);

		verify(service, chapters, authorization, context);
	}

	@ParameterizedTest
	@MethodSource("invalidLaptopUpdates")
	void laptopUpdateValidationCoversBatteryAndIdRules(InsertLaptopRequest request, String message) {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertLaptopRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).updateLaptop(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void tabletInsertRejectsMissingSubtypeRequirements() {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		InsertTabletRequest request = new InsertTabletRequest(2, "Apple", "iPad", 2022, "Ready To Donate", null, 103,
			"M1", 8, "LPDDR4", 256, "Flash", 400.0, LocalDate.now(), null, null, "Working", "iPad OS");
		expect(context.bodyAsClass(InsertTabletRequest.class)).andReturn(request);
		expectResult(context, 400, "Missing required parameters");
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).insertTablet(context);

		verify(service, chapters, authorization, context);
	}

	@ParameterizedTest
	@MethodSource("invalidTabletUpdates")
	void tabletUpdateValidationCoversSubtypeAndIdRequirements(InsertTabletRequest request, String message) {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertTabletRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).updateTablet(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void insertDesktopAuthorizesThenDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mutationContext(InsertDesktopRequest.class, desktop(), "user");
		authorization.requireChapterEditAccess(CHAPTER_ROLES, 2);
		expect(service.insertDesktop(desktop(), "user")).andReturn(101);
		expectJson(context, 201, new IdResponse(101));
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).insertDesktop(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void insertLaptopAuthorizesThenDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mutationContext(InsertLaptopRequest.class, laptop(), "user");
		authorization.requireChapterEditAccess(CHAPTER_ROLES, 2);
		expect(service.insertLaptop(laptop(), "user")).andReturn(102);
		expectJson(context, 201, new IdResponse(102));
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).insertLaptop(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void insertTabletAuthorizesThenDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mutationContext(InsertTabletRequest.class, tablet(), "user");
		authorization.requireChapterEditAccess(CHAPTER_ROLES, 2);
		expect(service.insertTablet(tablet(), "user")).andReturn(103);
		expectJson(context, 201, new IdResponse(103));
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).insertTablet(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void updateDesktopAuthorizesThenDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mutationContext(InsertDesktopRequest.class, desktop(), "user");
		authorization.requireChapterEditAccess(CHAPTER_ROLES, 2);
		service.updateDesktop(desktop(), "user");
		expectResult(context, 201, "Desktop updated successfully");
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).updateDesktop(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void updateLaptopAuthorizesThenDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mutationContext(InsertLaptopRequest.class, laptop(), "user");
		authorization.requireChapterEditAccess(CHAPTER_ROLES, 2);
		service.updateLaptop(laptop(), "user");
		expectResult(context, 200, "Laptop updated successfully");
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).updateLaptop(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void updateTabletAuthorizesThenDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mutationContext(InsertTabletRequest.class, tablet(), "user");
		authorization.requireChapterEditAccess(CHAPTER_ROLES, 2);
		service.updateTablet(tablet(), "user");
		expectResult(context, 200, "Tablet updated successfully");
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).updateTablet(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void changelogRejectsBadId() {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(context.pathParam("id")).andReturn("0");
		expectResult(context, 400, "Device ID must be a positive integer");
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDeviceChangelog(context);

		verify(service, chapters, authorization, context);
	}

	@Test
	void changelogDelegatesValidId() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		DeviceChangelogResponse[] changelog = new DeviceChangelogResponse[0];
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(context.pathParam("id")).andReturn("101");
		expect(service.getDeviceChangelog(List.of(2), 101)).andReturn(changelog);
		expectJson(context, 200, changelog);
		replay(service, chapters, authorization, context);

		new DeviceController(service, chapters, authorization).getDeviceChangelog(context);

		verify(service, chapters, authorization, context);
	}

	private static Stream<Arguments> invalidMonths() {
		return Stream.of(Arguments.of("0", "months must be between 1 and 120"),
			Arguments.of("121", "months must be between 1 and 120"),
			Arguments.of("many", "Invalid value for 'months': many"));
	}

	private static Stream<Arguments> invalidDesktops() {
		InsertDesktopRequest valid = desktop();
		return Stream.of(
			Arguments.of(new InsertDesktopRequest(0, valid.manufacturer(), valid.model(), valid.year(), valid.status(),
				valid.assetId(), valid.cpu(), valid.ram(), valid.ramGeneration(), valid.storageAmount(),
				valid.storageType(), valid.value(), valid.acquisitionDate(), valid.recipientId(), valid.donorId(),
				valid.hasWifi(), valid.operatingSystem()), "Missing required parameters"),
			Arguments.of(desktopWith(0, 512, 250.0, valid.acquisitionDate(), 101),
				"RAM amount must be positive or not specified"),
			Arguments.of(desktopWith(16, 0, 250.0, valid.acquisitionDate(), 101),
				"Storage amount must be positive or not specified"),
			Arguments.of(desktopWith(16, 512, -1.0, valid.acquisitionDate(), 101),
				"Value must be non-negative or not specified"),
			Arguments.of(desktopWith(16, 512, 250.0, LocalDate.now().plusDays(1), 101),
				"Acquisition date cannot be in the future"),
			Arguments.of(desktopWith(16, 512, 250.0, valid.acquisitionDate(), 0),
				"Asset ID must be positive or not specified"));
	}

	private static Stream<Arguments> invalidLaptopInserts() {
		return Stream.of(
			Arguments.of(
				new InsertLaptopRequest(2, "Lenovo", "ThinkPad", 2021, "In Progress", null, 102, "i7", 16, "DDR4", 512,
					"SSD", 350.0, LocalDate.now(), null, null, 5000, 4500, "Windows 11"),
				"Missing required parameters"),
			Arguments.of(laptopWith(0, 4500, 102), "Design battery capacity must be positive or not specified"),
			Arguments.of(laptopWith(5000, -1, 102), "Actual battery capacity must be non-negative or not specified"));
	}

	private static Stream<Arguments> invalidLaptopUpdates() {
		return Stream.of(
			Arguments.of(laptopWith(-1, 4500, 102), "Design battery capacity must be non-negative or not specified"),
			Arguments.of(laptopWith(5000, -1, 102), "Actual battery capacity must be non-negative or not specified"),
			Arguments.of(laptopWith(5000, 4500, 0), "Asset ID must be positive"));
	}

	private static Stream<Arguments> invalidTabletUpdates() {
		return Stream.of(
			Arguments.of(new InsertTabletRequest(2, "Apple", "iPad", 2022, "Ready To Donate", "Included", 103, "M1", 8,
				"LPDDR4", 256, "Flash", 400.0, LocalDate.now(), null, null, null, "iPad OS"),
				"Missing required parameters"),
			Arguments.of(
				new InsertTabletRequest(2, "Apple", "iPad", 2022, "Ready To Donate", "Included", 0, "M1", 8, "LPDDR4",
					256, "Flash", 400.0, LocalDate.now(), null, null, "Working", "iPad OS"),
				"Asset ID must be positive"));
	}

	private static InsertDesktopRequest desktopWith(Integer ram, Integer storage, Double value, LocalDate date,
		Integer assetId) {
		InsertDesktopRequest valid = desktop();
		return new InsertDesktopRequest(valid.chapterId(), valid.manufacturer(), valid.model(), valid.year(),
			valid.status(), assetId, valid.cpu(), ram, valid.ramGeneration(), storage, valid.storageType(), value, date,
			valid.recipientId(), valid.donorId(), valid.hasWifi(), valid.operatingSystem());
	}

	private static InsertLaptopRequest laptopWith(Integer designCapacity, Integer actualCapacity, Integer assetId) {
		InsertLaptopRequest valid = laptop();
		return new InsertLaptopRequest(valid.chapterId(), valid.manufacturer(), valid.model(), valid.year(),
			valid.status(), valid.includesCharger(), assetId, valid.cpu(), valid.ram(), valid.ramGeneration(),
			valid.storageAmount(), valid.storageType(), valid.value(), valid.acquisitionDate(), valid.recipientId(),
			valid.donorId(), designCapacity, actualCapacity, valid.operatingSystem());
	}

	private Context chapterStatsContext() {
		Context context = mock(Context.class);
		expect(context.queryParam("chapters")).andReturn("2");
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		return context;
	}

	private Context monthlyStatsContext() {
		Context context = mock(Context.class);
		expect(context.queryParam("months")).andReturn("6");
		expect(context.queryParam("chapters")).andReturn("2");
		expect(context.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		return context;
	}

	private <T> Context mutationContext(Class<T> bodyType, T request, String username) {
		Context context = mock(Context.class);
		expect(context.bodyAsClass(bodyType)).andReturn(request);
		expect(context.<List<ChapterRole>>attribute("chapterRoles")).andReturn(CHAPTER_ROLES);
		expect(context.<String>attribute("username")).andReturn(username);
		return context;
	}

	private void expectResult(Context context, int status, String result) {
		expect(context.status(status)).andReturn(context);
		expect(context.result(result)).andReturn(context);
	}

	private void expectJson(Context context, int status, Object body) {
		expect(context.status(status)).andReturn(context);
		expect(context.json(body)).andReturn(context);
	}
}
