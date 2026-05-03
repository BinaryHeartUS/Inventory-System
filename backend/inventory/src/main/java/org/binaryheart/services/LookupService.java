package org.binaryheart.services;

import org.binaryheart.enums.ChargerStatus;
import org.binaryheart.enums.Status;
import org.binaryheart.enums.WorkingBattery;
import org.binaryheart.repositories.LookupRepository;
import org.binaryheart.responses.LookupResponse;

import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class LookupService {

    private final LookupRepository repository = new LookupRepository();

    public LookupResponse getAll() throws SQLException {
        List<String> deviceStatuses = Arrays.stream(Status.values()).map(Status::getDatabaseValue)
                .collect(Collectors.toList());
        List<String> chargerStatuses = Arrays.stream(ChargerStatus.values()).map(ChargerStatus::getDatabaseValue)
                .collect(Collectors.toList());
        List<String> workingBatteryOpts = Arrays.stream(WorkingBattery.values()).map(WorkingBattery::getDatabaseValue)
                .collect(Collectors.toList());
        return new LookupResponse(deviceStatuses, chargerStatuses, workingBatteryOpts, repository.getManufacturers(),
                repository.getRamGenerations(), repository.getStorageTypes(), repository.getPartTypes());
    }
    }
}
