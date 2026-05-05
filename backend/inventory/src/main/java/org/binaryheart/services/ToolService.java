package org.binaryheart.services;

import java.sql.SQLException;
import java.util.List;
import java.util.stream.Collectors;

import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.repositories.ToolRepository;
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
}
