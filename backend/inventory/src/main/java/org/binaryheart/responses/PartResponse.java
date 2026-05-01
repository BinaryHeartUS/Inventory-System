package org.binaryheart.responses;

public record PartResponse(int id, int typeId, String description, boolean wasPurchased, Integer containedIn) {
}
