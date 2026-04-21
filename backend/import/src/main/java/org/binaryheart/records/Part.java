package org.binaryheart.records;

import org.binaryheart.enums.PartType;

public record Part(PartType type, String name, int quantity) {

}
