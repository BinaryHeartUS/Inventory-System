package org.binaryheart.requests;

public record CreateAccountRequest(String name, String username, String password, int chapterId, String role) {
}
