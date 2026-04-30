package org.binaryheart.services;

import java.sql.SQLException;
import java.util.List;

import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DeviceNotFoundException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.repositories.DeviceRepository;
import org.binaryheart.requests.InsertDesktopRequest;
import org.binaryheart.requests.InsertLaptopRequest;
import org.binaryheart.responses.GetDeviceResponse;

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

    public GetDeviceResponse getDevice(int id) throws BadArgumentException, DeviceNotFoundException, SQLException {
        return repository.getDevice(id);
        // ERROR CHECKING AND THROWING
    }

    public List<GetDeviceResponse> getAllDevices() throws SQLException {
        return repository.getAllDevices();
    }

    public void insertDesktop(InsertDesktopRequest request) throws SQLException {
        try {
            repository.insertDesktop(request);
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                System.err.println("Duplicate entry for desktop: " + request.model());
                throw new DuplicateKeyException("An asset with the same asset ID already exists: " + request.assetId());
            } else {
                throw new SQLException(e.getMessage());
            }
        }
    }

    public void insertLaptop(InsertLaptopRequest request) throws SQLException {
        try {
            repository.insertLaptop(request);
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                System.err.println("Duplicate entry for laptop: " + request.model());
                throw new DuplicateKeyException("An asset with the same asset ID already exists: " + request.assetId());
            } else {
                throw new SQLException(e.getMessage());
            }
        }
    }
}
