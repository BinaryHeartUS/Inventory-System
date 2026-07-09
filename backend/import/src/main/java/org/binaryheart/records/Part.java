package org.binaryheart.records;

public record Part(
    String type, String description, Integer quantity, String wasDonated, Double value) {
  public Part {
    if (type == null) {
      type = "Other";
    }
    if (description == null) description = "";
    if (quantity == null) {
      quantity = 0;
    }
    if (wasDonated == null) {
      wasDonated = "N";
    }
    if (value == null) {
      value = 0.0;
    }
  }
}
