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
	void deviceCountRejectsUnknownTypeAndStatusBeforeService() {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context typeContext = mock(Context.class);
		Context statusContext = mock(Context.class);
		expect(typeContext.pathParam("type")).andReturn("phone");
		expect(typeContext.queryParam("status")).andReturn(null);
		expectResult(typeContext, 400, "Unknown device type: phone");
		expect(statusContext.pathParam("type")).andReturn("desktop");
		expect(statusContext.queryParam("status")).andReturn("unknown").times(2);
		expectResult(statusContext, 400, "Unknown status: unknown");
		replay(service, chapters, authorization, typeContext, statusContext);
		DeviceController controller = new DeviceController(service, chapters, authorization);

		controller.getDeviceCount(typeContext);
		controller.getDeviceCount(statusContext);
		verify(service, chapters, authorization, typeContext, statusContext);
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
	void everyRemainingStatisticDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context dashboardContext = chapterStatsContext();
		Context averageContext = chapterStatsContext();
		Context completionContext = chapterStatsContext();
		Context activityContext = mock(Context.class);
		Context donatedContext = monthlyStatsContext();
		Context valueContext = monthlyStatsContext();
		Context summaryContext = mock(Context.class);
		DashboardCountsResponse dashboard = new DashboardCountsResponse(1, 2, 3, 4, 5, 6, 7, 8);
		AvgTimeInInventoryResponse average = new AvgTimeInInventoryResponse(4.0, 2);
		CompletionRateResponse completion = new CompletionRateResponse(3, 4);
		ChapterActivityStatsResponse activity = new ChapterActivityStatsResponse(4, 3, 2, 1);
		List<MonthlyCountPoint> donated = List.of(new MonthlyCountPoint(2026, 1, 2));
		List<MonthlyValuePoint> values = List.of(new MonthlyValuePoint(2026, 1, 20.0));
		List<ChapterInventorySummary> summary = List.of();
		expect(service.getDashboardCounts(List.of(2), List.of(2))).andReturn(dashboard);
		expectJson(dashboardContext, 200, dashboard);
		expect(service.getAvgTimeInInventory(List.of(2), List.of(2))).andReturn(average);
		expectJson(averageContext, 200, average);
		expect(service.getCompletionRate(List.of(2), List.of(2))).andReturn(completion);
		expectJson(completionContext, 200, completion);
		expect(activityContext.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(service.getChapterActivityStats(List.of(2))).andReturn(activity);
		expectJson(activityContext, 200, activity);
		expect(service.getDevicesDonated(List.of(2), List.of(2), 6)).andReturn(donated);
		expectJson(donatedContext, 200, donated);
		expect(service.getDonatedDeviceValue(List.of(2), List.of(2), 6)).andReturn(values);
		expectJson(valueContext, 200, values);
		expect(summaryContext.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(service.getChapterInventorySummary(List.of(2))).andReturn(summary);
		expectJson(summaryContext, 200, summary);
		replay(service, chapters, authorization, dashboardContext, averageContext, completionContext, activityContext,
			donatedContext, valueContext, summaryContext);
		DeviceController controller = new DeviceController(service, chapters, authorization);

		controller.getDashboardCounts(dashboardContext);
		controller.getAvgTimeInInventory(averageContext);
		controller.getCompletionRate(completionContext);
		controller.getChapterActivityStats(activityContext);
		controller.getDevicesDonated(donatedContext);
		controller.getDonatedDeviceValue(valueContext);
		controller.getChapterInventorySummary(summaryContext);

		verify(service, chapters, authorization, dashboardContext, averageContext, completionContext, activityContext,
			donatedContext, valueContext, summaryContext);
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
	void getDeviceRejectsMalformedAndNonPositiveIds() {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context malformed = mock(Context.class);
		Context negative = mock(Context.class);
		expect(malformed.pathParam("id")).andReturn("bad");
		expectResult(malformed, 400, "Non-numeric device ID: bad");
		expect(negative.pathParam("id")).andReturn("0");
		expectResult(negative, 400, "Device ID must be positive");
		replay(service, chapters, authorization, malformed, negative);
		DeviceController controller = new DeviceController(service, chapters, authorization);

		controller.getDevice(malformed);
		controller.getDevice(negative);
		verify(service, chapters, authorization, malformed, negative);
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
		authorization.requireChapterReadAccess(context, 2);
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
	@MethodSource("invalidLaptops")
	void laptopValidationCoversRequiredAndBatteryRules(InsertLaptopRequest request, String message, boolean update) {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertLaptopRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, chapters, authorization, context);
		DeviceController controller = new DeviceController(service, chapters, authorization);

		if (update)
			controller.updateLaptop(context);
		else
			controller.insertLaptop(context);
		verify(service, chapters, authorization, context);
	}

	@ParameterizedTest
	@MethodSource("invalidTablets")
	void tabletValidationCoversSubtypeRequirements(InsertTabletRequest request, String message, boolean update) {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context context = mock(Context.class);
		expect(context.bodyAsClass(InsertTabletRequest.class)).andReturn(request);
		expectResult(context, 400, message);
		replay(service, chapters, authorization, context);
		DeviceController controller = new DeviceController(service, chapters, authorization);

		if (update)
			controller.updateTablet(context);
		else
			controller.insertTablet(context);
		verify(service, chapters, authorization, context);
	}

	@Test
	void everyValidDeviceMutationAuthorizesThenDelegates() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context desktopInsert = mutationContext(InsertDesktopRequest.class, desktop(), "user");
		Context laptopInsert = mutationContext(InsertLaptopRequest.class, laptop(), "user");
		Context tabletInsert = mutationContext(InsertTabletRequest.class, tablet(), "user");
		Context desktopUpdate = mutationContext(InsertDesktopRequest.class, desktop(), "user");
		Context laptopUpdate = mutationContext(InsertLaptopRequest.class, laptop(), "user");
		Context tabletUpdate = mutationContext(InsertTabletRequest.class, tablet(), "user");
		authorization.requireChapterEditAccess(desktopInsert, 2);
		expect(service.insertDesktop(desktop(), "user")).andReturn(101);
		expectJson(desktopInsert, 201, new IdResponse(101));
		authorization.requireChapterEditAccess(laptopInsert, 2);
		expect(service.insertLaptop(laptop(), "user")).andReturn(102);
		expectJson(laptopInsert, 201, new IdResponse(102));
		authorization.requireChapterEditAccess(tabletInsert, 2);
		expect(service.insertTablet(tablet(), "user")).andReturn(103);
		expectJson(tabletInsert, 201, new IdResponse(103));
		authorization.requireChapterEditAccess(desktopUpdate, 2);
		service.updateDesktop(desktop(), "user");
		expectResult(desktopUpdate, 201, "Desktop updated successfully");
		authorization.requireChapterEditAccess(laptopUpdate, 2);
		service.updateLaptop(laptop(), "user");
		expectResult(laptopUpdate, 200, "Laptop updated successfully");
		authorization.requireChapterEditAccess(tabletUpdate, 2);
		service.updateTablet(tablet(), "user");
		expectResult(tabletUpdate, 200, "Tablet updated successfully");
		replay(service, chapters, authorization, desktopInsert, laptopInsert, tabletInsert, desktopUpdate, laptopUpdate,
			tabletUpdate);
		DeviceController controller = new DeviceController(service, chapters, authorization);

		controller.insertDesktop(desktopInsert);
		controller.insertLaptop(laptopInsert);
		controller.insertTablet(tabletInsert);
		controller.updateDesktop(desktopUpdate);
		controller.updateLaptop(laptopUpdate);
		controller.updateTablet(tabletUpdate);
		verify(service, chapters, authorization, desktopInsert, laptopInsert, tabletInsert, desktopUpdate, laptopUpdate,
			tabletUpdate);
	}

	@Test
	void changelogRejectsBadIdAndDelegatesValidId() throws Exception {
		DeviceService service = mock(DeviceService.class);
		ChapterService chapters = mock(ChapterService.class);
		AuthorizationService authorization = mock(AuthorizationService.class);
		Context invalid = mock(Context.class);
		Context valid = mock(Context.class);
		expect(invalid.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(invalid.pathParam("id")).andReturn("0");
		expectResult(invalid, 400, "Device ID must be a positive integer");
		DeviceChangelogResponse[] changelog = new DeviceChangelogResponse[0];
		expect(valid.<List<Integer>>attribute("chapterIds")).andReturn(List.of(2));
		expect(valid.pathParam("id")).andReturn("101");
		expect(service.getDeviceChangelog(List.of(2), 101)).andReturn(changelog);
		expectJson(valid, 200, changelog);
		replay(service, chapters, authorization, invalid, valid);
		DeviceController controller = new DeviceController(service, chapters, authorization);

		controller.getDeviceChangelog(invalid);
		controller.getDeviceChangelog(valid);
		verify(service, chapters, authorization, invalid, valid);
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

	private static Stream<Arguments> invalidLaptops() {
		InsertLaptopRequest valid = laptop();
		return Stream.of(
			Arguments.of(
				new InsertLaptopRequest(2, "Lenovo", "ThinkPad", 2021, "In Progress", null, 102, "i7", 16, "DDR4", 512,
					"SSD", 350.0, LocalDate.now(), null, null, 5000, 4500, "Windows 11"),
				"Missing required parameters", false),
			Arguments.of(laptopWith(0, 4500, 102), "Design battery capacity must be positive or not specified", false),
			Arguments.of(laptopWith(5000, -1, 102), "Actual battery capacity must be non-negative or not specified",
				false),
			Arguments.of(laptopWith(-1, 4500, 102), "Design battery capacity must be non-negative or not specified",
				true),
			Arguments.of(laptopWith(5000, -1, 102), "Actual battery capacity must be non-negative or not specified",
				true),
			Arguments.of(laptopWith(5000, 4500, 0), "Asset ID must be positive", true));
	}

	private static Stream<Arguments> invalidTablets() {
		return Stream.of(
			Arguments.of(
				new InsertTabletRequest(2, "Apple", "iPad", 2022, "Ready To Donate", null, 103, "M1", 8, "LPDDR4", 256,
					"Flash", 400.0, LocalDate.now(), null, null, "Working", "iPad OS"),
				"Missing required parameters", false),
			Arguments.of(
				new InsertTabletRequest(2, "Apple", "iPad", 2022, "Ready To Donate", "Included", 103, "M1", 8, "LPDDR4",
					256, "Flash", 400.0, LocalDate.now(), null, null, null, "iPad OS"),
				"Missing required parameters", true),
			Arguments.of(
				new InsertTabletRequest(2, "Apple", "iPad", 2022, "Ready To Donate", "Included", 0, "M1", 8, "LPDDR4",
					256, "Flash", 400.0, LocalDate.now(), null, null, "Working", "iPad OS"),
				"Asset ID must be positive", true));
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
