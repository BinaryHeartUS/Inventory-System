package org.binaryheart.requests;

public record UpdateOrganizationRequest(
    String name, String location, String contactName, String contactEmail) {}
