package org.binaryheart.jobs.chapters;

import static org.junit.jupiter.api.Assertions.*;
import static org.easymock.EasyMock.*;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;

class ChapterSyncTest {
	private static final String TOKEN = "test-chapter-directory-token-at-least-32";
	private static final String VALID = """
		{"chapters":[{"id":1,"name":"National","active":true},{"id":22,"name":"Local","active":false}]}
		""";

	@Test
	void requiresDedicatedSecretAndTrustedUrl() {
		assertFalse(new ChapterSyncConfig(URI.create("https://auth.binaryheart.org/api/service/chapters"), TOKEN)
			.toString().contains(TOKEN));
		assertThrows(IllegalArgumentException.class,
			() -> ChapterSyncConfig.from(Map.of("AUTH_ISSUER", "https://auth.binaryheart.org")));
		assertThrows(IllegalArgumentException.class,
			() -> ChapterSyncConfig.from(Map.of("AUTH_ISSUER", "https://auth.binaryheart.org", "CHAPTER_SYNC_TOKEN",
				TOKEN, "CHAPTER_DIRECTORY_URL", "http://untrusted.example/api/service/chapters")));
		assertThrows(IllegalArgumentException.class, () -> ChapterSyncConfig
			.from(Map.of("AUTH_ISSUER", "https://auth.binaryheart.org", "CHAPTER_SYNC_TOKEN", TOKEN + "\n")));
		assertEquals(URI.create("https://auth.binaryheart.org/api/service/chapters"), ChapterSyncConfig
			.from(Map.of("AUTH_ISSUER", "https://auth.binaryheart.org", "CHAPTER_SYNC_TOKEN", TOKEN)).directoryUrl());
		assertEquals("http", ChapterSyncConfig.from(Map.of("AUTH_ISSUER", "http://localhost:8082", "CHAPTER_SYNC_TOKEN",
			TOKEN, "CHAPTER_DIRECTORY_URL", "http://auth-api:8081/api/service/chapters")).directoryUrl().getScheme());
	}

	@Test
	void sendsOnlyDedicatedBearerAndValidatesCompleteSnapshot() throws Exception {
		HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
		server.createContext("/directory", exchange -> {
			assertEquals("Bearer " + TOKEN, exchange.getRequestHeaders().getFirst("Authorization"));
			assertNull(exchange.getRequestHeaders().getFirst("Cookie"));
			byte[] body = VALID.getBytes(java.nio.charset.StandardCharsets.UTF_8);
			exchange.sendResponseHeaders(200, body.length);
			try (var out = exchange.getResponseBody()) {
				out.write(body);
			}
		});
		server.start();
		try {
			String snapshot = client(server).fetch();
			assertTrue(snapshot.contains("\"active\":false"));
			assertTrue(snapshot.contains("\"id\":22"));
		} finally {
			server.stop(0);
		}
	}

	@Test
	void rejectsRedirectsHttpErrorsMalformedDuplicateAndIncompleteDirectories() throws Exception {
		for (String document : new String[]{"{}", "{\"chapters\":[]}",
				"{\"chapters\":[{\"id\":1,\"name\":\"National\",\"active\":false}]}",
				VALID.replace("\"id\":22", "\"id\":1"), VALID.replace("\"Local\"", "\"National\""),
				VALID.replace("\"id\":22", "\"id\":2.5"), VALID.replace("\"active\":false", "\"active\":\"false\""),
				VALID.replace("\"Local\"", "\"  Local  \""), "x".repeat(2 * 1024 * 1024 + 1)}) {
			HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
			server.createContext("/directory", exchange -> {
				byte[] body = document.getBytes(java.nio.charset.StandardCharsets.UTF_8);
				exchange.sendResponseHeaders(200, body.length);
				try (var out = exchange.getResponseBody()) {
					out.write(body);
				}
			});
			server.start();
			try {
				assertThrows(IOException.class, () -> client(server).fetch());
			} finally {
				server.stop(0);
			}
		}
		for (int status : new int[]{301, 401, 403, 503}) {
			HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
			AtomicInteger leaked = new AtomicInteger();
			server.createContext("/directory", exchange -> {
				exchange.getResponseHeaders().set("Location", "/leak");
				exchange.sendResponseHeaders(status, -1);
				exchange.close();
			});
			server.createContext("/leak", exchange -> {
				leaked.incrementAndGet();
				exchange.sendResponseHeaders(200, -1);
				exchange.close();
			});
			server.start();
			try {
				assertThrows(IOException.class, () -> client(server).fetch());
				assertEquals(0, leaked.get());
			} finally {
				server.stop(0);
			}
		}
	}

	@Test
	void reportsFailuresAndRecoversOnNextPollWithoutApplyingFailedFetch() throws Exception {
		ChapterDirectoryClient client = mock(ChapterDirectoryClient.class);
		ChapterSyncRepository repository = mock(ChapterSyncRepository.class);
		expect(client.fetch()).andThrow(new IOException("service unavailable"));
		expect(client.fetch()).andReturn("[]");
		expect(repository.apply("[]")).andReturn(3);
		replay(client, repository);
		try (ChapterSyncJob job = new ChapterSyncJob(client, repository)) {
			assertFalse(job.status().healthy());
			job.run();
			assertFalse(job.status().error().isBlank());
			job.run();
			assertTrue(job.status().healthy());
			assertEquals("", job.status().error());
		}
		verify(client, repository);
	}

	private ChapterDirectoryClient client(HttpServer server) {
		return new ChapterDirectoryClient(new ChapterSyncConfig(
			URI.create("http://127.0.0.1:" + server.getAddress().getPort() + "/directory"), TOKEN));
	}
}
