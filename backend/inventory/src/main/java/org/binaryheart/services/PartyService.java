package org.binaryheart.services;

import java.sql.SQLException;
import java.util.List;

import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.exceptions.PartyNotFoundException;
import org.binaryheart.repositories.PartyRepository;
import org.binaryheart.requests.InsertOrganizationRequest;
import org.binaryheart.requests.InsertPersonRequest;
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

    public void addOrganization(InsertOrganizationRequest request)
            throws MissingRequiredParametersException, BadArgumentException, DuplicateKeyException, SQLException {
        if (request.name() == null) {
            throw new MissingRequiredParametersException("Organization name must be non-null");
        }
        if (request.partyId() != null && request.partyId() < 0) {
            throw new BadArgumentException("Party ID must be non-negative, or null");
        }
        if (request.contactName() != null && request.contactName().length() == 0) {
            throw new BadArgumentException("Contact name must be non-empty, or null");
        }
        if (request.contactEmail() != null && request.contactEmail().length() == 0) {
            throw new BadArgumentException("Contact email must be non-empty, or null");
        }
        if (request.location() != null && request.location().length() == 0) {
            throw new BadArgumentException("Location must be non-empty, or null");
        }
		try {
            repository.addOrganization(request);
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                throw new DuplicateKeyException("A party with the same ID already exists: " + request.partyId());
            } else {
                throw e;
            }
        }
    }

    public void addPerson(InsertPersonRequest request)
            throws MissingRequiredParametersException, BadArgumentException, DuplicateKeyException, SQLException {
        if (request.name() == null) {
            throw new MissingRequiredParametersException("Person name must be non-null");
        }
        if (request.partyId() != null && request.partyId() < 0) {
            throw new BadArgumentException("Party ID must be non-negative, or null");
        }
        if (request.email() != null && request.email().length() == 0) {
            throw new BadArgumentException("Email must be non-empty, or null");
        }
        if (request.location() != null && request.location().length() == 0) {
            throw new BadArgumentException("Location must be non-empty, or null");
        }
        try {
            repository.addPerson(request);
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                throw new DuplicateKeyException("A party with the same ID already exists: " + request.partyId());
            } else {
                throw e;
            }
        }
    }
}
