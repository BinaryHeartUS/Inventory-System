package org.binaryheart.responses;

import org.binaryheart.models.ChapterRole;

import java.util.List;

public record AccountSummary(int id, String username, String name, List<ChapterRole> chapterRoles) {
}
