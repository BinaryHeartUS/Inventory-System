package org.binaryheart.responses;

import java.util.List;
import org.binaryheart.models.ChapterRole;

public record LoginResponse(
    String token, String username, List<ChapterRole> chapterRoles, String role) {}
