package org.binaryheart.requests;

public record InsertOrganizationRequest(Integer partyId, String name, String location, String contactName,
                String contactEmail) {
}
