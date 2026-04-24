package org.binaryheart.records;

public record Tool(String description, String type, Integer quantity, Double value) {
    public Tool {
        if (description == null) {
            description = "";
        }
        if (type == null) {
            type = "Other";
        }
        if (quantity == null) {
            quantity = 0;
        }
        if (value == null) {
            value = 0.0;
        }
    }
}
