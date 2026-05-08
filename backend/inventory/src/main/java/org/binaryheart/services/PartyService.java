package org.binaryheart.services;

import java.sql.SQLException;
import java.util.List;

import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.PartyNotFoundException;
import org.binaryheart.repositories.PartyRepository;
import org.binaryheart.responses.GetPartyResponse;

public class PartyService {

    private final PartyRepository repository = new PartyRepository();

    public List<GetPartyResponse> getAllParties() throws SQLException {
        return repository.getAllParties();
    }

    public GetPartyResponse getParty(int id) throws BadArgumentException, PartyNotFoundException, SQLException {
        if (id <= 0) {
            throw new BadArgumentException("Party ID must be positive");
        }
        return repository.getParty(id);
    }
}
