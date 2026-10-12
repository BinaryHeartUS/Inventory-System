package org.binaryheart.requests;

import java.util.List;
import java.time.LocalDate;

public record DeviceListRequest(String search, List<String> types, List<String> statuses, List<String> operatingSystems,
	boolean includeUnspecifiedOperatingSystem, boolean stuckOnly, Integer donorId, Integer recipientId, String sort,
	String dir, Integer yearFrom, Integer yearTo, LocalDate acquiredFrom, LocalDate acquiredTo, Integer limit,
	Integer offset) {
}
