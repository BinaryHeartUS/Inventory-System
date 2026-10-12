package org.binaryheart.requests;

import java.util.List;

public record DeviceListRequest(String search, List<String> types, List<String> statuses, List<String> operatingSystems,
	boolean includeUnspecifiedOperatingSystem, boolean stuckOnly, Integer donorId, Integer recipientId, String sort,
	String dir, Integer yearFrom, Integer yearTo, Integer limit, Integer offset) {
}
