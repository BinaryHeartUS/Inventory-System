package org.binaryheart.records;

import org.binaryheart.enums.PartType;

public record Part(PartType type, String description, Integer quantity) {
    public Part {
        if (type == null) {
            type = PartType.OTHER;
        }
        if (description == null)
            description = "";
        if (quantity == null) {
            quantity = 0;
        }
    }
}
