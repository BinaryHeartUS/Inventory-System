package org.binaryheart.responses;

public record ChapterSummary(int id, String name, boolean active) {
	public ChapterSummary(int id, String name) {
		this(id, name, true);
	}
}
