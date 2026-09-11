package org.binaryheart.services;

import com.google.inject.Inject;
import java.sql.SQLException;
import org.binaryheart.repositories.NoteRepository;
import org.binaryheart.responses.NoteResponse;

public class NoteService {
	private final NoteRepository repository;

	@Inject
	public NoteService(NoteRepository repository) {
		this.repository = repository;
	}

	public NoteResponse addNote(int assetId, String text) throws SQLException {
		return repository.addNote(assetId, text);
	}

	public NoteResponse[] getNotes(int assetId) throws SQLException {
		return repository.getNotes(assetId);
	}

	public int getAssetChapterId(int assetId) throws SQLException {
		return repository.getAssetChapterId(assetId);
	}

	public void updateNote(int assetId, int noteId, String text) throws SQLException {
		repository.updateNote(assetId, noteId, text);
	}
}
