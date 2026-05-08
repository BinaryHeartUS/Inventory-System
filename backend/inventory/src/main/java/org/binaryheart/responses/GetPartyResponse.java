package org.binaryheart.responses;

public record GetPartyResponse(int id, String name, String location, String individualEmail, String contactName,
        String contactEmail) {

}
