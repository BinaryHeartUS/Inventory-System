package org.binaryheart.services;

import org.binaryheart.requests.PostNoteRequest;
import org.binaryheart.responses.NoteResponse;

import java.sql.SQLException;

import org.binaryheart.Exceptions.MissingRequiredParametersException;
import org.binaryheart.repositories.NoteRepository;

public class NoteService {
    private final NoteRepository repository = new NoteRepository();

    public NoteResponse addNote(PostNoteRequest req) throws MissingRequiredParametersException, SQLException {
        if (req.note() == null || req.note().length() == 0)
            throw new MissingRequiredParametersException("Note must be provided with length > 0");

        return repository.addNote(req);
    }
}
