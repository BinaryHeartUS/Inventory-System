package org.binaryheart.responses;

import java.util.List;

public record LoginResponse(String token, String username, List<Integer> chapterIds) {
}
