package org.binaryheart.services;

import java.sql.SQLException;
import java.util.List;

import org.binaryheart.exceptions.BadArgumentException;
import org.binaryheart.exceptions.DeviceNotFoundException;
import org.binaryheart.exceptions.DuplicateKeyException;
import org.binaryheart.exceptions.MissingRequiredParametersException;
import org.binaryheart.repositories.DeviceRepository;
import org.binaryheart.requests.InsertDesktopRequest;
import org.binaryheart.requests.InsertLaptopRequest;
import org.binaryheart.responses.GetDeviceResponse;

public class DeviceService {

    private final DeviceRepository repository = new DeviceRepository();

    public int getDeviceCount(String type, String status) throws BadArgumentException, SQLException {
        if (!type.equals("desktop") && !type.equals("laptop") && !type.equals("tablet")) {
            throw new BadArgumentException("Unknown device type: " + type);
        }
        if (!status.equals("active") && !status.equals("ready-to-donate") && !status.equals("donated")) {
            throw new BadArgumentException("Unknown status: " + status);
        }
        return switch (status + ":" + type) {
        case "active:desktop" -> repository.getNumberOfDesktops();
        case "active:laptop" -> repository.getNumberOfLaptops();
        case "active:tablet" -> repository.getNumberOfTablets();
        case "ready-to-donate:desktop" -> repository.getNumberOfReadyToDonateDesktops();
        case "ready-to-donate:laptop" -> repository.getNumberOfReadyToDonateLaptops();
        case "ready-to-donate:tablet" -> repository.getNumberOfReadyToDonateTablets();
        case "donated:desktop" -> repository.getNumberOfDonatedDesktops();
        case "donated:laptop" -> repository.getNumberOfDonatedLaptops();
        case "donated:tablet" -> repository.getNumberOfDonatedTablets();
        default -> throw new IllegalStateException("Unhandled combination: " + status + ":" + type);
        };
    }

    public GetDeviceResponse getDevice(int id) throws BadArgumentException, DeviceNotFoundException, SQLException {
        if (id <= 0) {
            throw new BadArgumentException("Device ID must be positive");
        }
        return repository.getDevice(id);
    }

    public List<GetDeviceResponse> getAllDevices() throws SQLException {
        return repository.getAllDevices();
    }

    public void insertDesktop(InsertDesktopRequest request)
            throws MissingRequiredParametersException, BadArgumentException, DuplicateKeyException, SQLException {
        if (request.chapterId() == 0 || request.manufacturer() == null || request.manufacturer().strip().equals("")
                || request.model() == null || request.year() == 0 || request.status() == null) {
            throw new MissingRequiredParametersException("Missing required parameters");
        }
        if (request.ram() != null && request.ram() <= 0) {
            throw new BadArgumentException("RAM amount must be positive or not specified");
        }
        if (request.storageAmount() != null && request.storageAmount() <= 0) {
            throw new BadArgumentException("Storage amount must be positive or not specified");
        }
        if (request.value() != null && request.value() < 0) {
            throw new BadArgumentException("Value must be non-negative or not specified");
        }
        if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
            throw new BadArgumentException("Acquisition date cannot be in the future");
        }
        if (request.assetId() != null && request.assetId() <= 0) {
            throw new BadArgumentException("Asset ID must be positive or not specified");
        }
        try {
            repository.insertDesktop(request);
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                throw new DuplicateKeyException("An asset with the same asset ID already exists: " + request.assetId());
            } else {
                throw e;
            }
        }
    }

    public void insertLaptop(InsertLaptopRequest request)
            throws MissingRequiredParametersException, BadArgumentException, DuplicateKeyException, SQLException {
        if (request.chapterId() == 0 || request.manufacturer() == null || request.manufacturer().strip().equals("")
                || request.model() == null || request.year() == 0 || request.status() == null
                || request.includesCharger() == null) {
            throw new MissingRequiredParametersException("Missing required parameters");
        }
        if (request.ram() != null && request.ram() <= 0) {
            throw new BadArgumentException("RAM amount must be positive or not specified");
        }
        if (request.storageAmount() != null && request.storageAmount() <= 0) {
            throw new BadArgumentException("Storage amount must be positive or not specified");
        }
        if (request.value() != null && request.value() < 0) {
            throw new BadArgumentException("Value must be non-negative or not specified");
        }
        if (request.acquisitionDate() != null && request.acquisitionDate().isAfter(java.time.LocalDate.now())) {
            throw new BadArgumentException("Acquisition date cannot be in the future");
        }
        if (request.assetId() != null && request.assetId() <= 0) {
            throw new BadArgumentException("Asset ID must be positive or not specified");
        }
        if (request.designBatteryCapacity() != null && request.designBatteryCapacity() <= 0) {
            throw new BadArgumentException("Design battery capacity must be positive or not specified");
        }
        if (request.actualBatteryCapacity() != null && request.actualBatteryCapacity() < 0) {
            throw new BadArgumentException("Actual battery capacity must be non-negative or not specified");
        }
        try {
            repository.insertLaptop(request);
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                throw new DuplicateKeyException("An asset with the same asset ID already exists: " + request.assetId());
            } else {
                throw e;
            }
        }
    }
}
