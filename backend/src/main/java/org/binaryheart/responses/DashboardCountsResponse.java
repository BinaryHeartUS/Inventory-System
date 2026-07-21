package org.binaryheart.responses;

public record DashboardCountsResponse(int notStarted, int inProgress, int readyToDonate, int donated, int desktopActive,
	int laptopActive, int tabletActive, int totalActive) {
}
