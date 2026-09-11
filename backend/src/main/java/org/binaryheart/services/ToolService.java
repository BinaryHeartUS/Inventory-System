package org.binaryheart.services;

import com.google.inject.Inject;
import java.security.InvalidParameterException;
import java.sql.SQLException;
import java.util.List;
import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.ForbiddenException;
import org.binaryheart.exceptions.ToolNotFoundException;
import org.binaryheart.requests.ToolListRequest;
import org.binaryheart.repositories.ToolRepository;
import org.binaryheart.requests.InsertToolRequest;
import org.binaryheart.responses.GetToolResponse;
import org.binaryheart.responses.ToolChangelogResponse;

public class ToolService {

	private final ToolRepository repository;
	private final ChapterService chapterService;

	@Inject
	public ToolService(ToolRepository repository, ChapterService chapterService) {
		this.repository = repository;
		this.chapterService = chapterService;
	}

	/**
	 * Returns a page of tools scoped to the caller's chapters
	 * ({@code userChapterIds}), optionally narrowed to one {@code chapterId} (the
	 * UI filter, {@code null} for all).
	 */
	public List<GetToolResponse> getTools(List<Integer> userChapterIds, Integer chapterId, ToolListRequest q)
		throws SQLException, ForbiddenException {
		if (userChapterIds == null || userChapterIds.isEmpty())
			return List.of();
		List<Integer> effectiveChapterIds = chapterService.resolveChapterIds(chapterId, userChapterIds);
		return repository.getTools(effectiveChapterIds, q);
	}

	public GetToolResponse getTool(List<Integer> userChapterIds, Integer toolID) throws SQLException {
		if (userChapterIds == null || userChapterIds.isEmpty())
			return null;

		GetToolResponse tool = repository.getTool(toolID);
		if ((tool != null && userChapterIds.contains(tool.chapterId()))
			|| userChapterIds.contains(chapterService.getNationalChapterId()))
			return tool;

		return null;
	}

	public int insertTool(InsertToolRequest request, String username) throws DuplicateKeyException, SQLException {
		try {
			return repository.insertTool(request, username);
		} catch (SQLException e) {
			if ("23505".equals(e.getSQLState())) {
				throw new DuplicateKeyException("An asset with identical ID already exists: " + request.assetId());
			} else {
				throw e;
			}
		}
	}

	public void updateTool(InsertToolRequest request, String username) throws ToolNotFoundException, SQLException {
		try {
			repository.updateTool(request, username);
		} catch (SQLException e) {
			if ("02000".equals(e.getSQLState())) {
				throw new ToolNotFoundException("Could not find tool with specified ID: " + request.assetId());
			} else {
				throw e;
			}
		}
	}

	public ToolChangelogResponse[] getToolChangelog(List<Integer> userChapterIds, Integer toolId)
		throws SQLException, InvalidParameterException {
		GetToolResponse tool = repository.getTool(toolId);
		if (tool == null || (!userChapterIds.contains(tool.chapterId())
			&& !userChapterIds.contains(chapterService.getNationalChapterId()))) {
			throw new InvalidParameterException("Tool not found");
		}

		return repository.getToolChangelog(toolId);
	}

	public void deleteTool(List<Integer> userChapterIDs, Integer toolID)
		throws SQLException, BadArgumentException, ToolNotFoundException {
		GetToolResponse tool = repository.getTool(toolID);
		if ((tool != null && userChapterIDs.contains(tool.chapterId()))
			|| userChapterIDs.contains(chapterService.getNationalChapterId())) {
			try {
				repository.deleteTool(toolID);
			} catch (SQLException e) {
				if ("02000".equals(e.getSQLState())) {
					throw new ToolNotFoundException("Could not find tool with specified ID: " + toolID);
				} else {
					throw e;
				}
			}
		} else {
			throw new BadArgumentException("Tool not found in authorized chapters");
		}
	}
}
