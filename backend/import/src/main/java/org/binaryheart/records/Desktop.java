package org.binaryheart.records;

import java.time.LocalDate;
import org.binaryheart.enums.Status;

public record Desktop(
    String name,
    Integer ID,
    String manufacturer,
    Integer yearReleased,
    String notes,
    Status currentStatus,
    LocalDate dateUpdated) {

  public Desktop {
    if (name == null || name.strip().equals("")) {
      throw new IllegalArgumentException("Name cannot be null");
    }
    if (manufacturer == null) {
      manufacturer = "Unknown";
    }
    if (currentStatus == null) {
      currentStatus = Status.UNKNOWN;
    }
  }
}
