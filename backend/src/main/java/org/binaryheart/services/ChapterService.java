package org.binaryheart.services;

import java.sql.SQLException;
import java.util.List;
import org.binaryheart.exceptions.ForbiddenException;
import org.binaryheart.repositories.ChapterRepository;
import org.binaryheart.responses.ChapterSummary;

public class ChapterService {

	private final ChapterRepository repository = new ChapterRepository();

	public List<ChapterSummary> getAllChapters() throws SQLException {
		return repository.getAllChapters();
	}

	public int getNationalChapterId() throws SQLException {
		return repository.getNationalChapterId();
	}

	public Integer getChapterIdByName(String name) throws SQLException {
		return repository.getChapterIdByName(name);
	}

	/**
	 * Resolves the effective set of chapter ids a request may read, enforcing
	 * access control.
	 *
	 * @param requestedChapterIds
	 *            the chapters the caller asked to filter by; empty/null means "all
	 *            the caller can see".
	 * @param userChapterIds
	 *            the chapters the caller has access to (national admins see all).
	 * @return {@code null} when the caller is national and no specific chapters
	 *         were requested (meaning "all chapters"); otherwise the effective list
	 *         to filter by.
	 * @throws ForbiddenException
	 *             if a non-national caller requests a chapter they cannot access.
	 */
	public List<Integer> resolveChapterIds(List<Integer> requestedChapterIds, List<Integer> userChapterIds)
		throws SQLException, ForbiddenException {
		int nationalId = getNationalChapterId();
		boolean isNational = userChapterIds != null && userChapterIds.contains(nationalId);

		if (requestedChapterIds == null || requestedChapterIds.isEmpty()) {
			return isNational ? null : userChapterIds;
		}

		if (!isNational) {
			for (int id : requestedChapterIds) {
				if (userChapterIds == null || !userChapterIds.contains(id)) {
					throw new ForbiddenException("Access denied for chapter " + id);
				}
			}
		}
		return requestedChapterIds;
	}

	/**
	 * Convenience overload for a single optional chapter filter. {@code null} means
	 * "all the caller can see".
	 */
	public List<Integer> resolveChapterIds(Integer chapterId, List<Integer> userChapterIds)
		throws SQLException, ForbiddenException {
		return resolveChapterIds(chapterId == null ? List.of() : List.of(chapterId), userChapterIds);
	}

	public void deleteChapter(int id, int nationalChapterId, List<Integer> callerChapterIds) throws SQLException {
		if (id == nationalChapterId) {
			throw new IllegalArgumentException("The National chapter cannot be deleted");
		}
		if (!callerChapterIds.contains(nationalChapterId)) {
			throw new IllegalArgumentException("Only national admins may delete chapters");
		}
		repository.deleteChapter(id);
	}

	public ChapterSummary createChapter(String name) throws SQLException {
		if (name == null || name.isBlank()) {
			throw new IllegalArgumentException("Chapter name must not be blank");
		}
		return repository.createChapter(name.strip());
	}
}
