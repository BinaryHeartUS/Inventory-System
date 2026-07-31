package org.binaryheart.auth;

import java.util.List;
import org.binaryheart.models.ChapterRole;

public class TokenService {

	public String create(int volunteerId, String username, List<ChapterRole> chapterRoles, String effectiveRole) {
		return JwtService.create(volunteerId, username, chapterRoles, effectiveRole);
	}
}