package org.binaryheart.services;

import com.google.inject.Inject;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.PartyNotFoundException;
import org.binaryheart.repositories.PartyRepository;
import org.binaryheart.requests.InsertOrganizationRequest;
import org.binaryheart.requests.InsertPersonRequest;
import org.binaryheart.requests.UpdateOrganizationRequest;
import org.binaryheart.requests.UpdatePersonRequest;
import org.binaryheart.responses.GetPartyResponse;

public class PartyService {

	private final PartyRepository repository;

	@Inject
	public PartyService(PartyRepository repository) {
		this.repository = repository;
	}

	public List<GetPartyResponse> getAllParties(boolean getPerson, boolean getOrg) throws SQLException {
		if (getPerson && getOrg) {
			// get all parties
			return repository.getAllParties();
		} else if (getPerson) {
			// just get persons
			return repository.getAllPersons();
		} else if (getOrg) {
			// just get organizations
			return repository.getAllOrganizations();
		} else {
			return new ArrayList<GetPartyResponse>(); // empty list
		}
	}

	public GetPartyResponse getParty(int id) throws PartyNotFoundException, SQLException {
		return repository.getParty(id);
	}

	public void addOrganization(InsertOrganizationRequest request) throws DuplicateKeyException, SQLException {
		try {
			repository.addOrganization(request);
		} catch (SQLException e) {
			if ("23505".equals(e.getSQLState())) {
				throw new DuplicateKeyException("A party with the same ID already exists");
			} else {
				throw e;
			}
		}
	}

	public void addPerson(InsertPersonRequest request) throws DuplicateKeyException, SQLException {
		try {
			repository.addPerson(request);
		} catch (SQLException e) {
			if ("23505".equals(e.getSQLState())) {
				throw new DuplicateKeyException("A party with the same ID already exists");
			} else {
				throw e;
			}
		}
	}

	public void updatePerson(int id, UpdatePersonRequest request) throws PartyNotFoundException, SQLException {
		repository.getParty(id);
		repository.updatePerson(id, request);
	}

	public void updateOrganization(int id, UpdateOrganizationRequest request)
		throws PartyNotFoundException, SQLException {
		repository.getParty(id);
		repository.updateOrganization(id, request);
	}
}
