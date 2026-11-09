package org.binaryheart.auth;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.List;
import org.binaryheart.models.ChapterRole;

/**
 * Adapt central claims to Inventory's existing chapter-scoped authorization
 * model.
 */
public record CentralClaims(int accountId, String username, List<ChapterRole> chapterRoles, String role) {
	public static CentralClaims from(DecodedJWT jwt) {
		int id = Integer.parseInt(jwt.getSubject());
		String username = jwt.getClaim("username").asString();
		if (id <= 0 || username == null || username.isBlank()) {
			throw new IllegalArgumentException("Invalid central identity");
		}
		JsonNode chapters = jwt.getClaim("chapters").as(JsonNode.class);
		if (chapters == null || !chapters.isArray() || chapters.size() > 1000) {
			throw new IllegalArgumentException("Invalid chapter claims");
		}
		List<ChapterRole> assignments = new ArrayList<>();
		for (JsonNode chapter : chapters) {
			if (!chapter.path("id").isIntegralNumber() || !chapter.path("id").canConvertToInt()
				|| chapter.path("id").intValue() <= 0 || !chapter.path("roles").isArray()
				|| !chapter.path("app_roles").isArray()) {
				throw new IllegalArgumentException("Invalid chapter claims");
			}
			int chapterId = chapter.path("id").intValue();
			List<String> shared = strings(chapter.path("roles"));
			List<String> app = strings(chapter.path("app_roles"));
			String role = shared.contains("national_admin")
				? "Admin"
				: app.contains("admin")
					? "Inventory Admin"
					: shared.contains("chapter_admin")
						? "Chapter Admin"
						: app.contains("editor") ? "Editor" : app.contains("viewer") ? "Viewer" : null;
			if (role != null) {
				assignments.add(new ChapterRole(chapterId, role));
			}
		}
		if (assignments.isEmpty()) {
			throw new IllegalArgumentException("No Inventory access assigned");
		}
		String effective = assignments.stream().map(ChapterRole::role)
			.min(java.util.Comparator.comparingInt(CentralClaims::priority)).orElseThrow();
		return new CentralClaims(id, username, List.copyOf(assignments), effective);
	}

	private static List<String> strings(JsonNode roles) {
		List<String> values = new ArrayList<>();
		for (JsonNode role : roles) {
			if (!role.isTextual()) {
				throw new IllegalArgumentException("Invalid role claim");
			}
			values.add(role.textValue());
		}
		return values;
	}

	private static int priority(String role) {
		return switch (role) {
			case "Admin" -> 0;
			case "Inventory Admin" -> 1;
			case "Chapter Admin" -> 2;
			case "Editor" -> 3;
			default -> 4;
		};
	}
}
