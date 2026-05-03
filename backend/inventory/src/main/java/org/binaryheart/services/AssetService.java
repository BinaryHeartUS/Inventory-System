package org.binaryheart.services;

import java.sql.SQLException;

import org.binaryheart.repositories.AssetRepository;

public class AssetService {

    private final AssetRepository repository = new AssetRepository();

    public boolean assetExists(int id) throws SQLException {
        return repository.assetExists(id);
    }
}
