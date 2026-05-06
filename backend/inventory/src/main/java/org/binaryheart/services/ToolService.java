package org.binaryheart.services;

import java.sql.SQLException;
import java.util.List;
import java.util.stream.Collectors;

import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.repositories.ToolRepository;
import org.binaryheart.requests.InsertToolRequest;
import org.binaryheart.responses.GetToolResponse;

public class ToolService {

    private final ToolRepository repository = new ToolRepository();
    private final ChapterService chapterService = new ChapterService();

    public List<GetToolResponse> getAllTools(List<Integer> userChapterIds) throws SQLException {
        if (userChapterIds == null || userChapterIds.isEmpty())
            return List.of();
        if (userChapterIds.contains(chapterService.getNationalChapterId()))
            return repository.getAllTools();
        return repository.getAllTools().stream().filter(d -> {
            Integer cid = d.chapterId();
            return cid != null && userChapterIds.contains(cid);
        }).collect(Collectors.toList());
    }

    public GetToolResponse getTool(List<Integer> userChapterIds, Integer toolID)
            throws SQLException, MissingRequiredParametersException {
        if (toolID == null || toolID <= 0) {
            throw new MissingRequiredParametersException("Non-numeric or non-positive tool ID provided");
        }
        if (userChapterIds == null || userChapterIds.isEmpty())
            return null;

        GetToolResponse tool = repository.getTool(toolID);
        if ((tool != null && userChapterIds.contains(tool.chapterId()))
                || userChapterIds.contains(chapterService.getNationalChapterId()))
            return tool;

        return null;
    }

    public void insertTool(InsertToolRequest request)
            throws MissingRequiredParametersException, BadArgumentException, DuplicateKeyException, SQLException {
        if (request.chapterId() == 0 || request.description() == null) {
            throw new MissingRequiredParametersException("Missing required parameters");
        }
        if (request.description().length() == 0) {
            throw new BadArgumentException("Description cannot be emptry string");
        }
        if (request.value() != null && request.value() < 0) {
            throw new BadArgumentException("Value must be non-negative or not specified");
        }
        if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
            throw new BadArgumentException("Acquisition date cannot be in the future");
        }
        if (request.assetId() != null && request.assetId() <= 0) {
            throw new BadArgumentException("Asset ID must be positive or not specified");
        }
        try {
            repository.insertTool(request);
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                throw new DuplicateKeyException("An asset with identical ID already exists: " + request.assetId());
            } else {
                throw e;
            }
        }
    }
}
