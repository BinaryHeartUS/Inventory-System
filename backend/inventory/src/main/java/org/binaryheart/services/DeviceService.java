package org.binaryheart.services;

import java.sql.SQLException;

import org.binaryheart.repositories.DeviceRepository;

public class DeviceService {

    private final DeviceRepository repository = new DeviceRepository();

    public int getNumberOfDesktops() throws SQLException {
        return repository.getNumberOfDesktops();
    }

    public int getNumberOfLaptops() throws SQLException {
        return repository.getNumberOfLaptops();
    }

    public int getNumberOfTablets() throws SQLException {
        return repository.getNumberOfTablets();
    }

    public int getNumberOfReadyToDonateDesktops() throws SQLException {
        return repository.getNumberOfReadyToDonateDesktops();
    }

    public int getNumberOfReadyToDonateLaptops() throws SQLException {
        return repository.getNumberOfReadyToDonateLaptops();
    }

    public int getNumberOfReadyToDonateTablets() throws SQLException {
        return repository.getNumberOfReadyToDonateTablets();
    }

    public int getNumberOfDonatedDesktops() throws SQLException {
        return repository.getNumberOfDonatedDesktops();
    }

    public int getNumberOfDonatedLaptops() throws SQLException {
        return repository.getNumberOfDonatedLaptops();
    }

    public int getNumberOfDonatedTablets() throws SQLException {
        return repository.getNumberOfDonatedTablets();
    }
}
