package org.binaryheart.responses;

public record ChapterActivityStatsResponse(int totalChapters, int activeChapters, int chaptersWithPickupsReady,
        int chaptersWorkingOnDevices) {
}
