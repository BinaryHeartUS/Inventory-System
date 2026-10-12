package org.binaryheart.requests;

import java.util.List;

public record DeviceListRequest(String search, String type, List<String> statuses, boolean stuckOnly, Integer donorId,
	Integer recipientId, String sort, String dir, Integer limit, Integer offset) {
}
