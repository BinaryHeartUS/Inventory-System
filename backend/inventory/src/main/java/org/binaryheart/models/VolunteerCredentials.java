package org.binaryheart.models;

import java.util.List;

public record VolunteerCredentials(int id, String username, String passwordHash, String passwordSalt, List<ChapterRole> chapterRoles,
        String effectiveRole) {
}
