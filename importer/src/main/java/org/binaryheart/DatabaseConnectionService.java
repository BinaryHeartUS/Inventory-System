package org.binaryheart;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnectionService {

	private static final String URL = System.getenv().getOrDefault("DB_URL",
		"jdbc:postgresql://localhost:5432/inventory");
	private static final String USER = System.getenv().getOrDefault("DB_USER", "importer");
	private static final String PASSWORD = System.getenv().getOrDefault("DB_PASSWORD", "changeme_importer");

	private static Connection connection = null;

	public static boolean connect() {
		try {
			connection = DriverManager.getConnection(URL, USER, PASSWORD);
			return true;
		} catch (SQLException e) {
			e.printStackTrace();
			return false;
		}
	}

	public static Connection getConnection() {
		return connection;
	}

	public static void closeConnection() {
		try {
			if (connection != null) {
				connection.close();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static boolean isConnected() {
		try {
			return connection != null && !connection.isClosed();
		} catch (SQLException e) {
			e.printStackTrace();
			return false;
		}
	}
}
