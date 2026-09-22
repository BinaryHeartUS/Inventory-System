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
import java.time.LocalDate;
import java.util.List;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.MiscNotFoundException;
import org.binaryheart.repositories.MiscRepository;
import org.binaryheart.requests.InsertMiscRequest;
import org.binaryheart.responses.GetMiscResponse;
import org.binaryheart.responses.MiscChangelogResponse;
import org.junit.jupiter.api.Test;

class MiscServiceTest {

	private static final InsertMiscRequest REQUEST = new InsertMiscRequest(401, "Cable bundle", null, 25.0, 9);
	private static final GetMiscResponse RESPONSE = new GetMiscResponse(401, LocalDate.of(2026, 9, 22), 25.0,
		"Cable bundle", 9);

	@Test
	void getMiscAssetsDelegates() throws Exception {
		MiscRepository repository = mock(MiscRepository.class);
		expect(repository.getMiscAssets(9, 25, 25)).andReturn(List.of(RESPONSE));
		replay(repository);

		assertEquals(List.of(RESPONSE), new MiscService(repository).getMiscAssets(9, 25, 25));

		verify(repository);
	}

	@Test
	void getMiscDelegates() throws Exception {
		MiscRepository repository = mock(MiscRepository.class);
		expect(repository.getMisc(401)).andReturn(RESPONSE);
		replay(repository);

		assertSame(RESPONSE, new MiscService(repository).getMisc(401));

		verify(repository);
	}

	@Test
	void insertMiscTranslatesDuplicateSqlState() throws Exception {
		MiscRepository repository = mock(MiscRepository.class);
		expect(repository.insertMisc(REQUEST, "user")).andThrow(sql("23505"));
		replay(repository);

		assertThrows(DuplicateKeyException.class, () -> new MiscService(repository).insertMisc(REQUEST, "user"));

		verify(repository);
	}

	@Test
	void updateMiscTranslatesMissingSqlState() throws Exception {
		MiscRepository repository = mock(MiscRepository.class);
		repository.updateMisc(REQUEST, "user");
		expectLastCall().andThrow(sql("02000"));
		replay(repository);

		assertThrows(MiscNotFoundException.class, () -> new MiscService(repository).updateMisc(REQUEST, "user"));

		verify(repository);
	}

	@Test
	void changelogRequiresExistingMiscAsset() throws Exception {
		MiscRepository repository = mock(MiscRepository.class);
		expect(repository.getMisc(401)).andReturn(null);
		replay(repository);

		assertThrows(MiscNotFoundException.class, () -> new MiscService(repository).getMiscChangelog(401));

		verify(repository);
	}

	@Test
	void changelogDelegatesForExistingMiscAsset() throws Exception {
		MiscRepository repository = mock(MiscRepository.class);
		MiscChangelogResponse[] changelog = new MiscChangelogResponse[0];
		expect(repository.getMisc(401)).andReturn(RESPONSE);
		expect(repository.getMiscChangelog(401)).andReturn(changelog);
		replay(repository);

		assertSame(changelog, new MiscService(repository).getMiscChangelog(401));

		verify(repository);
	}

	private SQLException sql(String state) {
		return new SQLException("failure", state);
	}
}