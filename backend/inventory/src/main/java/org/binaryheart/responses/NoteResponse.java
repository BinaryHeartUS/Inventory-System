package org.binaryheart.responses;

import java.sql.Date;

public record NoteResponse(int id, String note, String date, int assetId) {
}
