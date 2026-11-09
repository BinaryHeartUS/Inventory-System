package org.binaryheart.jobs.chapters;

import com.google.inject.Inject;
import java.io.IOException;
import java.sql.SQLException;
import java.time.Instant;
import org.binaryheart.responses.ChapterSyncStatus;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ChapterSyncJob implements Runnable, AutoCloseable {
	private static final Logger LOG = LoggerFactory.getLogger(ChapterSyncJob.class);
	private final ChapterDirectoryClient client;
	private final ChapterSyncRepository repository;
	private final ScheduledExecutorService executor = Executors.newSingleThreadScheduledExecutor(runnable -> {
		Thread thread = new Thread(runnable, "chapter-directory-sync");
		thread.setDaemon(true);
		return thread;
	});
	private volatile Instant lastSuccess;
	private volatile String lastError;
	private boolean started;

	@Inject
	public ChapterSyncJob(ChapterDirectoryClient client, ChapterSyncRepository repository) {
		this.client = client;
		this.repository = repository;
	}

	public synchronized void start() {
		if (started)
			return;
		started = true;
		executor.scheduleWithFixedDelay(this, 0, 60, TimeUnit.SECONDS);
	}

	@Override
	public void run() {
		try {
			int count = repository.apply(client.fetch());
			lastSuccess = Instant.now();
			lastError = null;
			LOG.info("Chapter directory synchronized: {} chapters", count);
		} catch (IOException | SQLException | RuntimeException e) {
			lastError = "Chapter synchronization failed; see backend logs";
			LOG.error("Chapter directory synchronization failed; retaining last committed directory", e);
		}
	}

	public ChapterSyncStatus status() {
		Instant success = lastSuccess;
		return new ChapterSyncStatus(success == null ? "" : success.toString(),
			success != null && success.isAfter(Instant.now().minusSeconds(180)) && lastError == null,
			lastError == null ? "" : lastError);
	}

	@Override
	public void close() {
		executor.shutdownNow();
	}
}
