package org.binaryheart.services;

import java.sql.SQLException;
import java.util.List;
import java.util.stream.Collectors;

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
}
