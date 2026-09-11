package org.binaryheart.services;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.binaryheart.repositories.AssetRepository;
import org.junit.jupiter.api.Test;

class AssetServiceTest {

	@Test
	void assetExistsDelegatesToRepository() throws Exception {
		AssetRepository repository = mock(AssetRepository.class);
		expect(repository.assetExists(42)).andReturn(true);
		replay(repository);

		assertTrue(new AssetService(repository).assetExists(42));

		verify(repository);
	}
}