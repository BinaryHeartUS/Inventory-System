package org.binaryheart.services;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.sql.SQLException;
import java.util.List;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.repositories.PartyRepository;
import org.binaryheart.requests.InsertOrganizationRequest;
import org.binaryheart.requests.InsertPersonRequest;
import org.binaryheart.requests.UpdateOrganizationRequest;
import org.binaryheart.requests.UpdatePersonRequest;
import org.binaryheart.responses.GetPartyResponse;
import org.junit.jupiter.api.Test;

class PartyServiceTest {

	@Test
	void selectionUsesTheCorrectRepositoryMethod() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		List<GetPartyResponse> all = List.of(party());
		expect(repository.getAllParties()).andReturn(all);
		expect(repository.getAllPersons()).andReturn(all);
		expect(repository.getAllOrganizations()).andReturn(all);
		replay(repository);
		PartyService service = new PartyService(repository);

		assertSame(all, service.getAllParties(true, true));
		assertSame(all, service.getAllParties(true, false));
		assertSame(all, service.getAllParties(false, true));
		assertEquals(List.of(), service.getAllParties(false, false));

		verify(repository);
	}

	@Test
	void everyMutationAndReadDelegates() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		GetPartyResponse party = party();
		InsertOrganizationRequest organization = new InsertOrganizationRequest("Org", "Here", "Contact", "c@o.org");
		InsertPersonRequest person = new InsertPersonRequest("Person", "Here", "p@o.org");
		UpdateOrganizationRequest updateOrganization = new UpdateOrganizationRequest("Org", "There", null, null);
		UpdatePersonRequest updatePerson = new UpdatePersonRequest("Person", "There", null);
		expect(repository.getParty(9)).andReturn(party).times(3);
		repository.addOrganization(organization);
		repository.addPerson(person);
		repository.updateOrganization(9, updateOrganization);
		repository.updatePerson(9, updatePerson);
		replay(repository);
		PartyService service = new PartyService(repository);

		assertSame(party, service.getParty(9));
		service.addOrganization(organization);
		service.addPerson(person);
		service.updateOrganization(9, updateOrganization);
		service.updatePerson(9, updatePerson);

		verify(repository);
	}

	@Test
	void insertionsTranslateDuplicateSqlState() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		InsertOrganizationRequest organization = new InsertOrganizationRequest("Org", null, null, null);
		InsertPersonRequest person = new InsertPersonRequest("Person", null, null);
		repository.addOrganization(organization);
		expectLastCall().andThrow(new SQLException("duplicate", "23505"));
		repository.addPerson(person);
		expectLastCall().andThrow(new SQLException("duplicate", "23505"));
		replay(repository);
		PartyService service = new PartyService(repository);

		assertThrows(DuplicateKeyException.class, () -> service.addOrganization(organization));
		assertThrows(DuplicateKeyException.class, () -> service.addPerson(person));

		verify(repository);
	}

	private GetPartyResponse party() {
		return new GetPartyResponse(9, "Party", "Here", null, null, null);
	}
}