package org.binaryheart;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * Provides pooled JDBC connections backed by HikariCP. Callers obtain a
 * connection per unit of work and release it (ideally via try-with-resources);
 * closing a pooled connection returns it to the pool rather than tearing down
 * the underlying socket.
 */
public final class DatabaseConnectionService {

	private static final String URL = System.getenv().getOrDefault("DB_URL",
		"jdbc:postgresql://localhost:5432/inventory");
	private static final String USER = System.getenv().getOrDefault("DB_USER", "binaryheart");
	private static final String PASSWORD = System.getenv().getOrDefault("DB_PASSWORD", "changeme");

	private static final HikariDataSource DATA_SOURCE = createDataSource();

	private DatabaseConnectionService() {
	}

	private static HikariDataSource createDataSource() {
		HikariConfig config = new HikariConfig();
		config.setJdbcUrl(URL);
		config.setUsername(USER);
		config.setPassword(PASSWORD);
		config.setPoolName("inventory-pool");
		config.setMaximumPoolSize(Integer.parseInt(System.getenv().getOrDefault("DB_POOL_MAX_SIZE", "10")));
		config.setMinimumIdle(Integer.parseInt(System.getenv().getOrDefault("DB_POOL_MIN_IDLE", "2")));
		HikariDataSource dataSource = new HikariDataSource(config);
		Runtime.getRuntime().addShutdownHook(new Thread(dataSource::close));
		return dataSource;
	}

	public static void init() {
		if (DATA_SOURCE.isClosed()) {
			throw new IllegalStateException("Database connection pool failed to initialize");
		}
	}

	/**
	 * Borrows a connection from the pool. The caller owns the returned connection
	 * and must close it when finished to release it back to the pool.
	 */
	public static Connection getConnection() throws SQLException {
		return DATA_SOURCE.getConnection();
	}
}
