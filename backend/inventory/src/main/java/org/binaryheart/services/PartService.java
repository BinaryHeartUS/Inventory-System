
package org.binaryheart.services;

import java.sql.SQLException;

import org.binaryheart.repositories.PartRepository;
import org.binaryheart.responses.PartResponse;

public class PartService {
    private final PartRepository repository = new PartRepository();

    public PartResponse[] getAllParts() throws SQLException {
        return repository.getAllParts();
    }
}