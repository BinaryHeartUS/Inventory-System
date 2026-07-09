package org.binaryheart.responses;

import java.util.List;
import org.binaryheart.models.ChapterRole;

public record AccountSummary(
    int id, String username, String name, List<ChapterRole> chapterRoles) {}
