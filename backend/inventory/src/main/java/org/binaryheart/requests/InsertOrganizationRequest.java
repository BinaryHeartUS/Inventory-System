package org.binaryheart.requests;

public record InsertOrganizationRequest(String name, String location, String contactName,
                String contactEmail) {
}
