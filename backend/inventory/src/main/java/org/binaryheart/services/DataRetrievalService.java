package org.binaryheart.services;

import org.binaryheart.repositories.DataRetrievalRepository;

import java.sql.SQLException;
import java.util.List;

public class DataRetrievalService {

    private final DataRetrievalRepository repository = new DataRetrievalRepository();

    public List<String> getColumnNames(String tableName) throws SQLException {
        return repository.getColumnNames(tableName);
    }
}
