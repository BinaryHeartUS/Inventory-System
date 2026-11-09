package org.binaryheart.jobs.chapters;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.google.inject.Inject;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.util.HashSet;
import java.util.Set;

public class ChapterDirectoryClient {
	private static final int MAX_BYTES = 2 * 1024 * 1024;
	private final ChapterSyncConfig config;
	private final ObjectMapper json = new ObjectMapper().enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS);

	@Inject
	public ChapterDirectoryClient(ChapterSyncConfig config) {
		this.config = config;
	}

	public String fetch() throws IOException {
		HttpURLConnection connection = (HttpURLConnection) config.directoryUrl().toURL().openConnection();
		connection.setInstanceFollowRedirects(false);
		connection.setConnectTimeout(5000);
		connection.setReadTimeout(10000);
		connection.setRequestProperty("Authorization", "Bearer " + config.token());
		connection.setRequestProperty("Accept", "application/json");
		try {
			if (connection.getResponseCode() != 200) {
				throw new IOException("Chapter directory returned HTTP " + connection.getResponseCode());
			}
			byte[] body;
			try (InputStream input = connection.getInputStream()) {
				body = input.readNBytes(MAX_BYTES + 1);
			}
			if (body.length > MAX_BYTES)
				throw new IOException("Chapter directory exceeds size limit");
			JsonNode document = json.readTree(body);
			JsonNode chapters = document == null ? null : document.get("chapters");
			if (chapters == null || !chapters.isArray() || chapters.isEmpty() || chapters.size() > 10000) {
				throw new IOException("Invalid chapter directory");
			}
			Set<Integer> ids = new HashSet<>();
			Set<String> names = new HashSet<>();
			int national = 0;
			for (JsonNode chapter : chapters) {
				JsonNode id = chapter.path("id"), name = chapter.path("name"), active = chapter.path("active");
				if (!id.isIntegralNumber() || !id.canConvertToInt() || id.intValue() <= 0
					|| id.intValue() == Integer.MAX_VALUE || !name.isTextual() || name.textValue().isBlank()
					|| !name.textValue().equals(name.textValue().strip())
					|| name.textValue().codePointCount(0, name.textValue().length()) > 50 || !active.isBoolean()
					|| !ids.add(id.intValue()) || !names.add(name.textValue())) {
					throw new IOException("Invalid or duplicate chapter directory entry");
				}
				if (name.textValue().equals("National") && active.booleanValue())
					national++;
			}
			if (national != 1)
				throw new IOException("Chapter directory requires an active National chapter");
			return json.writeValueAsString(chapters);
		} finally {
			connection.disconnect();
		}
	}
}
