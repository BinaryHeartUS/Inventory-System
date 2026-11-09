package org.binaryheart.jobs.chapters;

import java.net.URI;
import java.util.Map;
import org.binaryheart.auth.CentralAuthConfig;

public record ChapterSyncConfig(URI directoryUrl, String token) {
	@Override
	public String toString() {
		return "ChapterSyncConfig[directoryUrl=" + directoryUrl + ", token=<redacted>]";
	}
	public static ChapterSyncConfig fromEnvironment() {
		return from(System.getenv());
	}

	public static ChapterSyncConfig from(Map<String, String> env) {
		CentralAuthConfig auth = CentralAuthConfig.from(env);
		URI url = URI.create(env.getOrDefault("CHAPTER_DIRECTORY_URL", auth.issuer() + "/api/service/chapters"));
		boolean localIssuer = auth.issuer().startsWith("http://localhost:")
			|| auth.issuer().startsWith("http://127.0.0.1:");
		if (url.getHost() == null
			|| (!"https".equals(url.getScheme()) && !(localIssuer && "http".equals(url.getScheme())))
			|| url.getRawUserInfo() != null || url.getRawQuery() != null || url.getRawFragment() != null) {
			throw new IllegalArgumentException("CHAPTER_DIRECTORY_URL requires HTTPS (HTTP allowed for local auth)");
		}
		String token = env.getOrDefault("CHAPTER_SYNC_TOKEN", "");
		if (token.length() < 32 || token.length() > 512 || !token.matches("[A-Za-z0-9_-]+")) {
			throw new IllegalArgumentException("CHAPTER_SYNC_TOKEN must be 32-512 URL-safe characters");
		}
		return new ChapterSyncConfig(url, token);
	}
}
