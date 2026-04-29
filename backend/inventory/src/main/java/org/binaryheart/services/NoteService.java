package org.binaryheart.services;

import org.binaryheart.responses.NoteResponse;

import java.sql.SQLException;

import org.binaryheart.Exceptions.MissingRequiredParametersException;
import org.binaryheart.repositories.NoteRepository;

public class NoteService {
    private final NoteRepository repository = new NoteRepository();

    public NoteResponse addNote(int assetId, String text) throws MissingRequiredParametersException, SQLException {
        if (text == null || text.length() == 0)
            throw new MissingRequiredParametersException("Note must be provided with length > 0");

        return repository.addNote(assetId, text);
    }
}
