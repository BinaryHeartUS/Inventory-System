package org.binaryheart.services;

import java.sql.SQLException;

import org.binaryheart.repositories.DeviceCountRepository;

public class DeviceCountService {

    private final DeviceCountRepository repository = new DeviceCountRepository();

    public int getNumberOfDesktops() throws SQLException {
        return repository.getNumberOfDesktops();
    }
}
