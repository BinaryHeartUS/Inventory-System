package org.binaryheart.requests;

public record DeviceListRequest(String search, String type, String status, boolean includeDonated,
	boolean includeScrapped, Integer donorId, Integer recipientId, String sort, String dir, Integer limit,
	Integer offset) {
}
