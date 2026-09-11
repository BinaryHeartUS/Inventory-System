package org.binaryheart.jobs.stuckdevices;

import com.google.inject.Inject;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.binaryheart.DatabaseConnectionService;

public class StuckDeviceJobRepository {
	@FunctionalInterface
	interface ConnectionSupplier {
		Connection get() throws SQLException;
	}

	private final ConnectionSupplier connections;

	@Inject
	public StuckDeviceJobRepository() {
		this(DatabaseConnectionService::getConnection);
	}

	StuckDeviceJobRepository(ConnectionSupplier connections) {
		this.connections = connections;
	}

	public int refresh(int thresholdDays) throws SQLException {
		try (Connection conn = connections.get();
			PreparedStatement stmt = conn.prepareStatement("SELECT Refresh_Stuck_Devices(?)")) {
			stmt.setInt(1, thresholdDays);
			try (ResultSet rs = stmt.executeQuery()) {
				rs.next();
				return rs.getInt(1);
			}
		}
	}
}