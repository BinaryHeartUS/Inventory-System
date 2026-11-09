package org.binaryheart.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import io.javalin.http.ForbiddenResponse;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.binaryheart.DatabaseConnectionService;
import org.binaryheart.models.ChapterRole;
import org.binaryheart.requests.InsertDesktopRequest;
import org.binaryheart.requests.InsertLaptopRequest;
import org.binaryheart.requests.InsertPartRequest;
import org.binaryheart.requests.InsertTabletRequest;
import org.binaryheart.requests.InsertToolRequest;
import org.binaryheart.services.AuthorizationService;
import org.binaryheart.services.ChapterService;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@EnabledIfEnvironmentVariable(
	named = "INVENTORY_SECURITY_DB_TEST",
	matches = "true")
class AssetMutationIntegrationTest {
	private final DeviceRepository devices = new DeviceRepository();
	private final PartRepository parts = new PartRepository();
	private final ToolRepository tools = new ToolRepository();

	@BeforeAll
	static void requireDisposableDatabase() throws Exception {
		try (Connection connection = DatabaseConnectionService.getConnection();
			var statement = connection.createStatement();
			var result = statement.executeQuery("SELECT current_database()")) {
			result.next();
			if (!result.getString(1).startsWith("inventory_security_test"))
				throw new IllegalStateException(
					"Security integration tests require a disposable inventory_security_test database");
		}
		try (Connection connection = DatabaseConnectionService.getConnection();
			var statement = connection.createStatement()) {
			statement.execute("""
				SELECT Apply_Chapter_Directory('[
				  {"id":1,"name":"National","active":true},
				  {"id":2,"name":"Security Chapter A","active":true},
				  {"id":3,"name":"Security Chapter B","active":true}
				]')
				""");
		}
	}

	@ParameterizedTest
	@ValueSource(
		strings = {"desktop", "laptop", "tablet", "part", "tool"})
	void sourceAndDestinationAuthorizationAreEnforcedByActualRepository(String kind) throws Exception {
		int id = mutate(kind, 3, null, null);
		assertThrows(ForbiddenResponse.class, () -> mutate(kind, 2, id, List.of(2)));
		assertChapter(id, 3);
		assertThrows(ForbiddenResponse.class, () -> mutate(kind, 2, id, List.of(3)));
		assertChapter(id, 3);
		mutate(kind, 2, id, List.of(2, 3));
		assertChapter(id, 2);
		mutate(kind, 3, id, null);
		assertChapter(id, 3);
	}

	@ParameterizedTest
	@ValueSource(
		strings = {"desktop", "laptop", "tablet", "part", "tool"})
	void adminElsewhereDoesNotAllowDeletionInViewerChapter(String kind) throws Exception {
		int id = mutate(kind, 3, null, null);
		var authorization = new AuthorizationService(new ChapterService(new ChapterRepository()));
		List<Integer> allowed = authorization.mutationChapterIds(
			List.of(new ChapterRole(2, "Inventory Admin"), new ChapterRole(3, "Viewer"), new ChapterRole(1, "Viewer")),
			true);
		assertEquals(List.of(2), allowed);
		assertThrows(ForbiddenResponse.class, () -> delete(kind, id, allowed));
		assertChapter(id, 3);
		delete(kind, id, List.of(3));
	}

	@Test
	void partEndpointCannotDeleteADevice() throws Exception {
		int id = mutate("desktop", 2, null, null);
		SQLException error = assertThrows(SQLException.class, () -> parts.deletePart(id, "security-test", List.of(2)));
		assertEquals("02000", error.getSQLState());
		assertChapter(id, 2);
	}

	@Test
	void concurrentTransferIsReauthorizedAfterRowLockWait() throws Exception {
		int id = mutate("tool", 2, null, null);
		try (Connection transfer = DatabaseConnectionService.getConnection();
			var executor = Executors.newSingleThreadExecutor()) {
			transfer.setAutoCommit(false);
			AssetMutationGuard.requireAccess(transfer, id, 3, List.of(2, 3));
			try (var statement = transfer.prepareStatement("UPDATE Asset SET Chapter_ID = 3 WHERE ID = ?")) {
				statement.setInt(1, id);
				statement.executeUpdate();
			}
			CountDownLatch started = new CountDownLatch(1);
			var attempt = executor.submit(() -> {
				started.countDown();
				assertThrows(ForbiddenResponse.class, () -> tools.deleteTool(id, List.of(2)));
			});
			try {
				org.junit.jupiter.api.Assertions.assertTrue(started.await(5, TimeUnit.SECONDS));
				boolean blocked = false;
				long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
				while (!blocked && System.nanoTime() < deadline) {
					try (var statement = transfer.createStatement()) {
						statement.execute("SELECT pg_stat_clear_snapshot()");
					}
					try (var statement = transfer.createStatement();
						var result = statement.executeQuery(
							"SELECT EXISTS (SELECT 1 FROM pg_stat_activity WHERE pg_backend_pid() = ANY(pg_blocking_pids(pid)))")) {
						result.next();
						blocked = result.getBoolean(1);
					}
					if (!blocked)
						Thread.sleep(10);
				}
				org.junit.jupiter.api.Assertions.assertTrue(blocked,
					"Deletion must wait for the transfer's asset lock");
				transfer.commit();
			} finally {
				transfer.rollback();
			}
			attempt.get(10, TimeUnit.SECONDS);
		}
		assertChapter(id, 3);
	}

	private void delete(String kind, int id, List<Integer> allowed) throws SQLException {
		if ("part".equals(kind))
			parts.deletePart(id, "security-test", allowed);
		else if ("tool".equals(kind))
			tools.deleteTool(id, allowed);
		else
			devices.deleteDevice(id, "security-test", allowed);
	}

	private void assertChapter(int id, int expected) throws SQLException {
		try (Connection connection = DatabaseConnectionService.getConnection();
			var statement = connection.prepareStatement("SELECT Chapter_ID FROM Asset WHERE ID = ?")) {
			statement.setInt(1, id);
			try (var result = statement.executeQuery()) {
				org.junit.jupiter.api.Assertions.assertTrue(result.next());
				assertEquals(expected, result.getInt(1));
			}
		}
	}

	private int mutate(String kind, int chapter, Integer id, List<Integer> allowed) throws SQLException {
		switch (kind) {
			case "desktop" -> {
				var request = new InsertDesktopRequest(chapter, "Test", "Desktop", 2024, "Not Started", id, null, 0,
					null, 0, null, 0.0, null, null, null, false, null, null);
				if (id == null)
					return devices.insertDesktop(request, "security-test");
				devices.updateDesktop(request, "security-test", allowed);
			}
			case "laptop" -> {
				var request = new InsertLaptopRequest(chapter, "Test", "Laptop", 2024, "Not Started", "Included", id,
					null, 0, null, 0, null, 0.0, null, null, null, null, null, null, null);
				if (id == null)
					return devices.insertLaptop(request, "security-test");
				devices.updateLaptop(request, "security-test", allowed);
			}
			case "tablet" -> {
				var request = new InsertTabletRequest(chapter, "Test", "Tablet", 2024, "Not Started", "Included", id,
					null, 0, null, 0, null, 0.0, null, null, null, "Yes", null, null);
				if (id == null)
					return devices.insertTablet(request, "security-test");
				devices.updateTablet(request, "security-test", allowed);
			}
			case "part" -> {
				var request = new InsertPartRequest(chapter, "RAM", "Security test", true, null, id, null, 0.0, null);
				if (id == null)
					return parts.insertPart(request, "security-test");
				parts.updatePart(request, "security-test", allowed);
			}
			case "tool" -> {
				var request = new InsertToolRequest(chapter, id, "Security test", null, 0.0, null);
				if (id == null)
					return tools.insertTool(request, "security-test");
				tools.updateTool(request, "security-test", allowed);
			}
			default -> throw new IllegalArgumentException("Unknown test asset type");
		}
		return id;
	}
}
