package org.binaryheart.responses;

import java.util.List;

public record LookupResponse(List<String> deviceStatuses, List<String> chargerStatuses, List<String> workingBatteryOpts,
        List<String> manufacturers, List<String> ramGenerations, List<String> storageTypes, List<String> partTypes,
        List<String> operatingSystems) {
}
