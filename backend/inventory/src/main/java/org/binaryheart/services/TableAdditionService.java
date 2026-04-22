package org.binaryheart.services;

import org.binaryheart.repositories.TableAdditionRepository;

import java.sql.SQLException;

public class TableAdditionService {

    private final TableAdditionRepository repository = new TableAdditionRepository();

    public void addTable(String tableName, String columnName) throws SQLException {
        repository.createTable(tableName, columnName);
    }
}
