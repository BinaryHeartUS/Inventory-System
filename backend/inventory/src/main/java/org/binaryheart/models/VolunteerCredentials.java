package org.binaryheart.models;

import java.util.List;

public record VolunteerCredentials(int id, String username, String passwordHash, List<Integer> chapterIds) {
}
