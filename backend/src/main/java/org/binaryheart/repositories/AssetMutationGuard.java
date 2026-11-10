package org.binaryheart.repositories;

import io.javalin.http.ForbiddenResponse;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

final class AssetMutationGuard {
	private AssetMutationGuard() {
	}

	/**
	 * Hold the persisted source chapter stable until the caller commits its
	 * mutation. A null chapter list represents an authorized National-level role.
	 */
	static void requireAccess(Connection connection, int assetId, Integer destinationChapterId,
		List<Integer> allowedChapterIds) throws SQLException {
		if (connection.getAutoCommit())
			throw new IllegalStateException("Asset authorization requires a transaction");
		try (PreparedStatement statement = connection
			.prepareStatement("SELECT Chapter_ID FROM Asset WHERE ID = ? FOR UPDATE")) {
			statement.setInt(1, assetId);
			try (ResultSet result = statement.executeQuery()) {
				if (!result.next())
					throw new SQLException("Asset not found", "02000");
				int sourceChapterId = result.getInt(1);
				if (allowedChapterIds != null && (!allowedChapterIds.contains(sourceChapterId)
					|| (destinationChapterId != null && !allowedChapterIds.contains(destinationChapterId))))
					throw new ForbiddenResponse("Access denied: insufficient role for asset chapter");
			}
		}
	}
}
