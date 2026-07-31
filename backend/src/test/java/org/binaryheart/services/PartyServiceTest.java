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
	void getAllPartiesReturnsPeopleAndOrganizations() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		List<GetPartyResponse> all = List.of(party());
		expect(repository.getAllParties()).andReturn(all);
		replay(repository);
		PartyService service = new PartyService(repository);

		assertSame(all, service.getAllParties(true, true));

		verify(repository);
	}

	@Test
	void getAllPartiesReturnsPeopleOnly() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		List<GetPartyResponse> all = List.of(party());
		expect(repository.getAllPersons()).andReturn(all);
		replay(repository);
		PartyService service = new PartyService(repository);

		assertSame(all, service.getAllParties(true, false));

		verify(repository);
	}

	@Test
	void getAllPartiesReturnsOrganizationsOnly() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		List<GetPartyResponse> all = List.of(party());
		expect(repository.getAllOrganizations()).andReturn(all);
		replay(repository);
		PartyService service = new PartyService(repository);

		assertSame(all, service.getAllParties(false, true));

		verify(repository);
	}

	@Test
	void getAllPartiesReturnsEmptyWhenNeitherTypeRequested() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		replay(repository);
		PartyService service = new PartyService(repository);

		assertEquals(List.of(), service.getAllParties(false, false));

		verify(repository);
	}

	@Test
	void getPartyDelegates() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		GetPartyResponse party = party();
		expect(repository.getParty(9)).andReturn(party);
		replay(repository);
		PartyService service = new PartyService(repository);

		assertSame(party, service.getParty(9));

		verify(repository);
	}

	@Test
	void addOrganizationDelegates() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		InsertOrganizationRequest organization = new InsertOrganizationRequest("Org", "Here", "Contact", "c@o.org");
		repository.addOrganization(organization);
		replay(repository);
		PartyService service = new PartyService(repository);

		service.addOrganization(organization);

		verify(repository);
	}

	@Test
	void addPersonDelegates() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		InsertPersonRequest person = new InsertPersonRequest("Person", "Here", "p@o.org");
		repository.addPerson(person);
		replay(repository);
		PartyService service = new PartyService(repository);

		service.addPerson(person);

		verify(repository);
	}

	@Test
	void updateOrganizationDelegates() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		GetPartyResponse party = party();
		UpdateOrganizationRequest updateOrganization = new UpdateOrganizationRequest("Org", "There", null, null);
		expect(repository.getParty(9)).andReturn(party);
		repository.updateOrganization(9, updateOrganization);
		replay(repository);
		PartyService service = new PartyService(repository);

		service.updateOrganization(9, updateOrganization);

		verify(repository);
	}

	@Test
	void updatePersonDelegates() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		GetPartyResponse party = party();
		UpdatePersonRequest updatePerson = new UpdatePersonRequest("Person", "There", null);
		expect(repository.getParty(9)).andReturn(party);
		repository.updatePerson(9, updatePerson);
		replay(repository);
		PartyService service = new PartyService(repository);

		service.updatePerson(9, updatePerson);

		verify(repository);
	}

	@Test
	void addOrganizationTranslatesDuplicateSqlState() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		InsertOrganizationRequest organization = new InsertOrganizationRequest("Org", null, null, null);
		repository.addOrganization(organization);
		expectLastCall().andThrow(new SQLException("duplicate", "23505"));
		replay(repository);
		PartyService service = new PartyService(repository);

		assertThrows(DuplicateKeyException.class, () -> service.addOrganization(organization));

		verify(repository);
	}

	@Test
	void addPersonTranslatesDuplicateSqlState() throws Exception {
		PartyRepository repository = mock(PartyRepository.class);
		InsertPersonRequest person = new InsertPersonRequest("Person", null, null);
		repository.addPerson(person);
		expectLastCall().andThrow(new SQLException("duplicate", "23505"));
		replay(repository);
		PartyService service = new PartyService(repository);

		assertThrows(DuplicateKeyException.class, () -> service.addPerson(person));

		verify(repository);
	}

	private GetPartyResponse party() {
		return new GetPartyResponse(9, "Party", "Here", null, null, null);
	}
}