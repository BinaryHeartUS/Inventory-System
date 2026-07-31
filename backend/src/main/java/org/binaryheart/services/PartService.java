package org.binaryheart.services;

import com.google.inject.Inject;
import java.security.InvalidParameterException;
import java.sql.SQLException;
import java.util.List;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.ForbiddenException;
import org.binaryheart.exceptions.PartNotFoundException;
import org.binaryheart.requests.PartListRequest;
import org.binaryheart.repositories.PartRepository;
import org.binaryheart.requests.InsertPartRequest;
import org.binaryheart.responses.PartChangelogResponse;
import org.binaryheart.responses.PartResponse;
import org.binaryheart.responses.PartTypeCountResponse;

public class PartService {
	private final PartRepository repository;
	private final ChapterService chapterService;

	@Inject
	public PartService(PartRepository repository, ChapterService chapterService) {
		this.repository = repository;
		this.chapterService = chapterService;
	}

	/**
	 * Returns a page of parts scoped to the caller's chapters
	 * ({@code userChapterIds}), optionally narrowed to one {@code chapterId} (the
	 * UI filter, {@code null} for all).
	 */
	public PartResponse[] getParts(List<Integer> userChapterIds, Integer chapterId, PartListRequest q)
		throws SQLException, ForbiddenException {
		if (userChapterIds == null || userChapterIds.isEmpty())
			return new PartResponse[0];
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(chapterId, userChapterIds);
		return repository.getParts(effectiveChapterIds, q);
	}

	public List<PartTypeCountResponse> getPartTypeCounts(List<Integer> userChapterIds, Integer chapterId,
		PartListRequest q) throws SQLException, ForbiddenException {
		if (userChapterIds == null || userChapterIds.isEmpty())
			return List.of();
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(chapterId, userChapterIds);
		return repository.getPartTypeCounts(effectiveChapterIds, q);
	}

	public PartResponse getPart(List<Integer> userChapterIds, Integer partId) throws SQLException {
		if (userChapterIds == null || userChapterIds.isEmpty())
			return null;

		PartResponse part = repository.getPart(partId);
		if ((part != null && userChapterIds.contains(part.chapterId()))
			|| userChapterIds.contains(chapterService.getNationalChapterId()))
			return part;

		return null;
	}

	public PartResponse[] getPartsByDevice(List<Integer> userChapterIds, Integer deviceId) throws SQLException {
		if (userChapterIds == null || userChapterIds.isEmpty())
			return new PartResponse[0];
		PartResponse[] parts = repository.getPartsByDevice(deviceId);
		if (userChapterIds.contains(chapterService.getNationalChapterId()))
			return parts;
		return List.of(parts).stream().filter(p -> userChapterIds.contains(p.chapterId())).toArray(PartResponse[]::new);
	}

	public void deletePart(List<Integer> userChapterIds, Integer partId, String username)
		throws SQLException, InvalidParameterException {
		if (partId == null || partId < 0)
			throw new InvalidParameterException(
				"Non-numeric or non-positive part ID provided, must be positive integer");

		PartResponse part = repository.getPart(partId);
		if ((part != null && userChapterIds.contains(part.chapterId()))
			|| userChapterIds.contains(chapterService.getNationalChapterId())) {
			repository.deletePart(partId, username);
		} else {
			throw new InvalidParameterException("Part not found");
		}
	}

	public void updatePart(InsertPartRequest request, String username) throws PartNotFoundException, SQLException {
		try {
			repository.updatePart(request, username);
		} catch (SQLException e) {
			if ("02000".equals(e.getSQLState())) {
				throw new PartNotFoundException("Could not find part with specified ID: " + request.id());
			} else {
				throw e;
			}
		}
	}

	public int insertPart(InsertPartRequest request, String username) throws DuplicateKeyException, SQLException {
		try {
			return repository.insertPart(request, username);
		} catch (SQLException e) {
			if ("23505".equals(e.getSQLState())) {
				throw new DuplicateKeyException("An asset with the same asset ID already exists: " + request.id());
			} else {
				throw e;
			}
		}
	}

	public PartChangelogResponse[] getPartChangelog(List<Integer> userChapterIds, Integer partId)
		throws SQLException, InvalidParameterException {
		PartResponse part = repository.getPart(partId);
		if (part == null || (!userChapterIds.contains(part.chapterId())
			&& !userChapterIds.contains(chapterService.getNationalChapterId()))) {
			throw new InvalidParameterException("Part not found");
		}

		return repository.getPartChangelog(partId);
	}
}
