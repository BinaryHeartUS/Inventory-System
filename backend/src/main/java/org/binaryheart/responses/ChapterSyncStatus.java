package org.binaryheart.responses;

public record ChapterSyncStatus(String lastSuccessAt, boolean healthy, String error) {
}
