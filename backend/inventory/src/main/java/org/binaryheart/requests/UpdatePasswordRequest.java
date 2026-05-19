package org.binaryheart.requests;

public record UpdatePasswordRequest(int volunteerId, String newPassword) {
}
