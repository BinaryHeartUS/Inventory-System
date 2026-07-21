package org.binaryheart.requests;

public record PartListRequest(String search, String type, String source, boolean includeInDevice, Integer donorId,
	Integer limit, Integer offset) {
}
