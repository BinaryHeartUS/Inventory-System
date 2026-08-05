package org.binaryheart.jobs.stuckdevices;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import org.junit.jupiter.api.Test;

class StuckDeviceJobRepositoryTest {
	@Test
	void refreshCallsDatabaseFunctionWithThreshold() throws Exception {
		Connection connection = mock(Connection.class);
		PreparedStatement statement = mock(PreparedStatement.class);
		ResultSet resultSet = mock(ResultSet.class);
		expect(connection.prepareStatement("SELECT Refresh_Stuck_Devices(?)")).andReturn(statement);
		statement.setInt(1, 14);
		expect(statement.executeQuery()).andReturn(resultSet);
		expect(resultSet.next()).andReturn(true);
		expect(resultSet.getInt(1)).andReturn(3);
		resultSet.close();
		statement.close();
		connection.close();
		replay(connection, statement, resultSet);

		StuckDeviceJobRepository repository = new StuckDeviceJobRepository(() -> connection);

		assertEquals(3, repository.refresh(14));
		verify(connection, statement, resultSet);
	}
}