package org.binaryheart.services;

import com.google.inject.Inject;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.binaryheart.enums.ChargerStatus;
import org.binaryheart.enums.Status;
import org.binaryheart.enums.WorkingBattery;
import org.binaryheart.repositories.LookupRepository;
import org.binaryheart.responses.LookupResponse;

public class LookupService {

	private final LookupRepository repository;

	@Inject
	public LookupService(LookupRepository repository) {
		this.repository = repository;
	}

	public LookupResponse getAll() throws SQLException {
		List<String> deviceStatuses = Arrays.stream(Status.values()).map(Status::getDatabaseValue)
			.collect(Collectors.toList());
		List<String> chargerStatuses = Arrays.stream(ChargerStatus.values()).map(ChargerStatus::getDatabaseValue)
			.collect(Collectors.toList());
		List<String> workingBatteryOpts = Arrays.stream(WorkingBattery.values()).map(WorkingBattery::getDatabaseValue)
			.collect(Collectors.toList());
		return new LookupResponse(deviceStatuses, chargerStatuses, workingBatteryOpts, repository.getManufacturers(),
			repository.getRamGenerations(), repository.getStorageTypes(), repository.getPartTypes(),
			repository.getOperatingSystems());
	}

	public void addManufacturer(String name) throws SQLException {
		repository.insertManufacturer(name.strip());
	}

	public void addRamGeneration(String name) throws SQLException {
		repository.insertRamGeneration(name.strip());
	}

	public void addStorageType(String name) throws SQLException {
		repository.insertStorageType(name.strip());
	}

	public void addPartType(String name) throws SQLException {
		repository.insertPartType(name.strip());
	}

	public void removeManufacturer(String name) throws SQLException {
		repository.deleteManufacturer(name);
	}

	public void removeRamGeneration(String name) throws SQLException {
		repository.deleteRamGeneration(name);
	}

	public void removeStorageType(String name) throws SQLException {
		repository.deleteStorageType(name);
	}

	public void removePartType(String name) throws SQLException {
		repository.deletePartType(name);
	}

	public void addOperatingSystem(String name) throws SQLException {
		repository.insertOperatingSystem(name.strip());
	}

	public void removeOperatingSystem(String name) throws SQLException {
		repository.deleteOperatingSystem(name);
	}

}
