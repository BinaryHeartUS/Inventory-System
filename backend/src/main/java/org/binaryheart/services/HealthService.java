package org.binaryheart.services;

import com.google.inject.Inject;
import java.sql.SQLException;
import org.binaryheart.repositories.HealthRepository;

public class HealthService {

	private final HealthRepository repository;

	@Inject
	public HealthService(HealthRepository repository) {
		this.repository = repository;
	}

	public String live() {
		return "OK";
	}

	public String ready() throws SQLException {
		repository.checkDatabaseConnection();
		return "OK";
	}
}
