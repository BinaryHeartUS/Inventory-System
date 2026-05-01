package org.binaryheart.services;

import org.binaryheart.repositories.ChapterRepository;
import org.binaryheart.responses.ChapterSummary;

import java.sql.SQLException;
import java.util.List;

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

    public ChapterSummary createChapter(String name) throws SQLException {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Chapter name must not be blank");
        }
        return repository.createChapter(name.strip());
    }
}
