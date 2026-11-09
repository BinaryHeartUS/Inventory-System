package org.binaryheart.repositories;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import io.javalin.http.ForbiddenResponse;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import org.junit.jupiter.api.Test;

class AssetMutationGuardTest {
	@Test
	void submittedAuthorizedChapterCannotHideUnauthorizedSource() throws Exception {
		assertAccess(3, 2, List.of(2), false);
	}

	@Test
	void authorizedSourceCannotMoveToUnauthorizedDestination() throws Exception {
		assertAccess(2, 3, List.of(2), false);
	}

	@Test
	void permittedSourceAndDestinationCanBeUpdated() throws Exception {
		assertAccess(2, 3, List.of(2, 3), true);
	}

	@Test
	void permittedSourceCanBeDeleted() throws Exception {
		assertAccess(2, null, List.of(2), true);
	}

	@Test
	void viewerOnlySourceCannotBeDeleted() throws Exception {
		assertAccess(3, null, List.of(2), false);
	}

	@Test
	void nationalScopeAllowsAnySourceAndDestination() throws Exception {
		assertAccess(3, 4, null, true);
	}

	@Test
	void emptyScopeDeniesAllAssets() throws Exception {
		assertAccess(2, null, List.of(), false);
	}

	@Test
	void guardCannotRunOutsideMutationTransaction() throws Exception {
		Connection connection = mock(Connection.class);
		expect(connection.getAutoCommit()).andReturn(true);
		replay(connection);
		assertThrows(IllegalStateException.class,
			() -> AssetMutationGuard.requireAccess(connection, 101, 2, List.of(2)));
		verify(connection);
	}

	@Test
	void missingAssetUsesExistingNotFoundSqlState() throws Exception {
		Connection connection = mock(Connection.class);
		PreparedStatement statement = mock(PreparedStatement.class);
		ResultSet result = mock(ResultSet.class);
		expect(connection.getAutoCommit()).andReturn(false);
		expect(connection.prepareStatement("SELECT Chapter_ID FROM Asset WHERE ID = ? FOR UPDATE"))
			.andReturn(statement);
		statement.setInt(1, 101);
		expect(statement.executeQuery()).andReturn(result);
		expect(result.next()).andReturn(false);
		result.close();
		statement.close();
		replay(connection, statement, result);
		SQLException error = assertThrows(SQLException.class,
			() -> AssetMutationGuard.requireAccess(connection, 101, 2, List.of(2)));
		assertEquals("02000", error.getSQLState());
		verify(connection, statement, result);
	}

	private void assertAccess(int source, Integer destination, List<Integer> allowed, boolean permitted)
		throws Exception {
		Connection connection = mock(Connection.class);
		PreparedStatement statement = mock(PreparedStatement.class);
		ResultSet result = mock(ResultSet.class);
		expect(connection.getAutoCommit()).andReturn(false);
		expect(connection.prepareStatement("SELECT Chapter_ID FROM Asset WHERE ID = ? FOR UPDATE"))
			.andReturn(statement);
		statement.setInt(1, 101);
		expect(statement.executeQuery()).andReturn(result);
		expect(result.next()).andReturn(true);
		expect(result.getInt(1)).andReturn(source);
		result.close();
		statement.close();
		replay(connection, statement, result);
		if (permitted)
			AssetMutationGuard.requireAccess(connection, 101, destination, allowed);
		else
			assertThrows(ForbiddenResponse.class,
				() -> AssetMutationGuard.requireAccess(connection, 101, destination, allowed));
		verify(connection, statement, result);
	}
}
