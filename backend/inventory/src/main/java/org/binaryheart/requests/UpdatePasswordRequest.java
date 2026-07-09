package org.binaryheart.requests;

public record UpdatePasswordRequest(String currentPassword, String newPassword) {}
