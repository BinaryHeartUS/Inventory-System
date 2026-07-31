package org.binaryheart.services;

import com.google.inject.Inject;
import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import java.sql.SQLException;
import java.util.List;
import java.util.Set;
import org.binaryheart.models.ChapterRole;

public class AuthorizationService {

	private static final Set<String> WRITE_ROLES = Set.of("Admin", "Chapter Admin", "Editor");
	private final ChapterService chapterService;

	@Inject
	public AuthorizationService(ChapterService chapterService) {
		this.chapterService = chapterService;
	}

	public void requireChapterEditAccess(Context ctx, int chapterId) throws SQLException {
		List<ChapterRole> chapterRoles = ctx.attribute("chapterRoles");
		if (chapterRoles == null || chapterRoles.isEmpty())
			throw new ForbiddenResponse("Access denied");

		int nationalId = chapterService.getNationalChapterId();
		for (ChapterRole chapterRole : chapterRoles) {
			if (!WRITE_ROLES.contains(chapterRole.role()))
				continue;
			if (chapterRole.chapterId() == nationalId || chapterRole.chapterId() == chapterId)
				return;
		}

		throw new ForbiddenResponse("Access denied: insufficient role for chapter " + chapterId);
	}

	public void requireChapterReadAccess(Context ctx, int chapterId) throws SQLException {
		List<ChapterRole> chapterRoles = ctx.attribute("chapterRoles");
		if (chapterRoles == null || chapterRoles.isEmpty())
			throw new ForbiddenResponse("Access denied");

		int nationalId = chapterService.getNationalChapterId();
		for (ChapterRole chapterRole : chapterRoles) {
			if (chapterRole.chapterId() == nationalId || chapterRole.chapterId() == chapterId)
				return;
		}

		throw new ForbiddenResponse("Access denied: not a member of chapter " + chapterId);
	}
}