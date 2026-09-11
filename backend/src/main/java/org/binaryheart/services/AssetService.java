package org.binaryheart.services;

import com.google.inject.Inject;
import java.sql.SQLException;
import org.binaryheart.repositories.AssetRepository;

public class AssetService {

	private final AssetRepository repository;

	@Inject
	public AssetService(AssetRepository repository) {
		this.repository = repository;
	}

	public boolean assetExists(int id) throws SQLException {
		return repository.assetExists(id);
	}
}
