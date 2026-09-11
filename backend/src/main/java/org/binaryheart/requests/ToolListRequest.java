package org.binaryheart.requests;

public record ToolListRequest(String search, Integer donorId, Integer limit, Integer offset) {
}
