package org.binaryheart.records;

import org.binaryheart.enums.PartType;

public record Part(PartType type, String description, Integer quantity, String wasDonated, Double value) {
    public Part {
        if (type == null) {
            type = PartType.OTHER;
        }
        if (description == null)
            description = "";
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
