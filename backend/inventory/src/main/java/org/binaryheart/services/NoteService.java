package org.binaryheart.services;

import java.sql.SQLException;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.repositories.NoteRepository;
import org.binaryheart.responses.NoteResponse;

public class NoteService {
  private final NoteRepository repository = new NoteRepository();

  public NoteResponse addNote(int assetId, String text)
      throws MissingRequiredParametersException, SQLException {
    if (text == null || text.length() == 0)
      throw new MissingRequiredParametersException("Note must be provided with length > 0");

    return repository.addNote(assetId, text);
  }

  public NoteResponse[] getNotes(int assetId) throws SQLException {
    return repository.getNotes(assetId);
  }

  public int getAssetChapterId(int assetId) throws SQLException {
    return repository.getAssetChapterId(assetId);
  }

  public void updateNote(int assetId, int noteId, String text)
      throws MissingRequiredParametersException, SQLException {
    if (text == null || text.length() == 0)
      throw new MissingRequiredParametersException("Note must be provided with length > 0");

    repository.updateNote(assetId, noteId, text);
  }
}
