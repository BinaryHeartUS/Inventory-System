package org.binaryheart.requests;

public record LoginRequest(String username, String password, String salt) {
}
