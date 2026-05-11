package org.binaryheart.requests;

public record InsertPersonRequest(Integer partyId, String name, String location, String email) {
}
