package org.binaryheart.responses;

public record ChapterInventorySummary(int chapterId, String chapterName, int desktopCount, int laptopCount,
	int tabletCount, int notStarted, int inProgress, int readyToDonate, int donated, int scrapped, int totalDevices,
	int partsCount, int toolsCount) {
}
