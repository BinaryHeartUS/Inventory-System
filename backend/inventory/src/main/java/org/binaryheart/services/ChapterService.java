package org.binaryheart.services;

import java.sql.SQLException;
import java.util.List;
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

  public void deleteChapter(int id, int nationalChapterId, List<Integer> callerChapterIds)
      throws SQLException {
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
