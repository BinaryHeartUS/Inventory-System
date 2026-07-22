package org.binaryheart.responses;

/**
 * A part type and the total number of parts of that type matching the active
 * filters.
 */
public record PartTypeCountResponse(String type, int count) {
}
