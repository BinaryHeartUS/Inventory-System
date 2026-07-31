package org.binaryheart.services;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.util.List;
import org.binaryheart.repositories.LookupRepository;
import org.binaryheart.responses.LookupResponse;
import org.junit.jupiter.api.Test;

class LookupServiceTest {

	@Test
	void getAllCombinesEnumsAndEveryRepositoryList() throws Exception {
		LookupRepository repository = mock(LookupRepository.class);
		expect(repository.getManufacturers()).andReturn(List.of("Dell"));
		expect(repository.getRamGenerations()).andReturn(List.of("DDR4"));
		expect(repository.getStorageTypes()).andReturn(List.of("SSD"));
		expect(repository.getPartTypes()).andReturn(List.of("RAM"));
		expect(repository.getOperatingSystems()).andReturn(List.of("Linux"));
		replay(repository);

		LookupResponse response = new LookupService(repository).getAll();

		assertEquals(List.of("Dell"), response.manufacturers());
		assertEquals(List.of("DDR4"), response.ramGenerations());
		assertEquals(List.of("SSD"), response.storageTypes());
		assertEquals(List.of("RAM"), response.partTypes());
		assertEquals(List.of("Linux"), response.operatingSystems());
		assertFalse(response.deviceStatuses().isEmpty());
		assertFalse(response.chargerStatuses().isEmpty());
		assertFalse(response.workingBatteryOpts().isEmpty());
		verify(repository);
	}

	@Test
	void addManufacturerTrimsAndDelegates() throws Exception {
		LookupRepository repository = mock(LookupRepository.class);
		repository.insertManufacturer("Dell");
		replay(repository);
		LookupService service = new LookupService(repository);

		service.addManufacturer(" Dell ");

		verify(repository);
	}

	@Test
	void addRamGenerationTrimsAndDelegates() throws Exception {
		LookupRepository repository = mock(LookupRepository.class);
		repository.insertRamGeneration("DDR4");
		replay(repository);
		LookupService service = new LookupService(repository);

		service.addRamGeneration(" DDR4 ");

		verify(repository);
	}

	@Test
	void addStorageTypeTrimsAndDelegates() throws Exception {
		LookupRepository repository = mock(LookupRepository.class);
		repository.insertStorageType("SSD");
		replay(repository);
		LookupService service = new LookupService(repository);

		service.addStorageType(" SSD ");

		verify(repository);
	}

	@Test
	void addPartTypeTrimsAndDelegates() throws Exception {
		LookupRepository repository = mock(LookupRepository.class);
		repository.insertPartType("RAM");
		replay(repository);
		LookupService service = new LookupService(repository);

		service.addPartType(" RAM ");

		verify(repository);
	}

	@Test
	void addOperatingSystemTrimsAndDelegates() throws Exception {
		LookupRepository repository = mock(LookupRepository.class);
		repository.insertOperatingSystem("Linux");
		replay(repository);
		LookupService service = new LookupService(repository);

		service.addOperatingSystem(" Linux ");

		verify(repository);
	}

	@Test
	void removeManufacturerDelegates() throws Exception {
		LookupRepository repository = mock(LookupRepository.class);
		repository.deleteManufacturer("Dell");
		replay(repository);
		LookupService service = new LookupService(repository);

		service.removeManufacturer("Dell");

		verify(repository);
	}

	@Test
	void removeRamGenerationDelegates() throws Exception {
		LookupRepository repository = mock(LookupRepository.class);
		repository.deleteRamGeneration("DDR4");
		replay(repository);
		LookupService service = new LookupService(repository);

		service.removeRamGeneration("DDR4");

		verify(repository);
	}

	@Test
	void removeStorageTypeDelegates() throws Exception {
		LookupRepository repository = mock(LookupRepository.class);
		repository.deleteStorageType("SSD");
		replay(repository);
		LookupService service = new LookupService(repository);

		service.removeStorageType("SSD");

		verify(repository);
	}

	@Test
	void removePartTypeDelegates() throws Exception {
		LookupRepository repository = mock(LookupRepository.class);
		repository.deletePartType("RAM");
		replay(repository);
		LookupService service = new LookupService(repository);

		service.removePartType("RAM");

		verify(repository);
	}

	@Test
	void removeOperatingSystemDelegates() throws Exception {
		LookupRepository repository = mock(LookupRepository.class);
		repository.deleteOperatingSystem("Linux");
		replay(repository);
		LookupService service = new LookupService(repository);

		service.removeOperatingSystem("Linux");

		verify(repository);
	}
}