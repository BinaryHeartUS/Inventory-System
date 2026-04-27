package org.binaryheart.responses;

import org.binaryheart.models.ChapterRole;

import java.util.List;

public record LoginResponse(String token, String username, List<ChapterRole> chapterRoles, String role) {
}
