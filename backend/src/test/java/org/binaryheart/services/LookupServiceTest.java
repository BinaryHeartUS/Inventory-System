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
	void everyMutationDelegatesAndAdditionsAreTrimmed() throws Exception {
		LookupRepository repository = mock(LookupRepository.class);
		repository.insertManufacturer("Dell");
		repository.insertRamGeneration("DDR4");
		repository.insertStorageType("SSD");
		repository.insertPartType("RAM");
		repository.insertOperatingSystem("Linux");
		repository.deleteManufacturer("Dell");
		repository.deleteRamGeneration("DDR4");
		repository.deleteStorageType("SSD");
		repository.deletePartType("RAM");
		repository.deleteOperatingSystem("Linux");
		replay(repository);
		LookupService service = new LookupService(repository);

		service.addManufacturer(" Dell ");
		service.addRamGeneration(" DDR4 ");
		service.addStorageType(" SSD ");
		service.addPartType(" RAM ");
		service.addOperatingSystem(" Linux ");
		service.removeManufacturer("Dell");
		service.removeRamGeneration("DDR4");
		service.removeStorageType("SSD");
		service.removePartType("RAM");
		service.removeOperatingSystem("Linux");

		verify(repository);
	}
}