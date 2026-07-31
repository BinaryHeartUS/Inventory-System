package org.binaryheart.auth;

import com.google.inject.Inject;
import java.util.List;
import org.binaryheart.models.ChapterRole;

public class TokenService {
	private final JwtService jwtService;

	@Inject
	public TokenService(JwtService jwtService) {
		this.jwtService = jwtService;
	}

	public String create(int volunteerId, String username, List<ChapterRole> chapterRoles, String effectiveRole) {
		return jwtService.create(volunteerId, username, chapterRoles, effectiveRole);
	}
}