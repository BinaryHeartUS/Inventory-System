
package org.binaryheart.services;

import java.sql.SQLException;
import java.util.List;
import java.util.stream.Collectors;

import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.repositories.PartRepository;
import org.binaryheart.responses.PartResponse;

public class PartService {
    private final PartRepository repository = new PartRepository();
    private final ChapterService chapterService = new ChapterService();

    public PartResponse[] getAllParts(List<Integer> userChapterIds) throws SQLException {
        if (userChapterIds == null || userChapterIds.isEmpty())
            return new PartResponse[0];
        if (userChapterIds.contains(chapterService.getNationalChapterId()))
            return repository.getAllParts();
        return List.of(repository.getAllParts()).stream().filter(d -> {
            Integer cid = d.chapterId();
            return cid != null && userChapterIds.contains(cid);
        }).collect(Collectors.toList()).toArray(new PartResponse[0]);
    }

    public PartResponse getPart(List<Integer> userChapterIds, Integer partId)
            throws SQLException, MissingRequiredParametersException {

        if (partId == null || partId < 0)
            throw new MissingRequiredParametersException(
                    "Non-numeric or non-positive part ID provided, must be positive integer");
        if (userChapterIds == null || userChapterIds.isEmpty())
            return null;

        PartResponse part = repository.getPart(partId);
        if ((part != null && userChapterIds.contains(part.chapterId()))
                || userChapterIds.contains(chapterService.getNationalChapterId()))
            return part;

        return null;
    }
}