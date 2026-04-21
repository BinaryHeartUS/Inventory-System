package org.binaryheart;

import java.lang.reflect.RecordComponent;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;

public class SheetReader<T extends Record> {
    private Sheet sheet;
    private Class<T> recordClass;
    private int currentRowIndex;

    public SheetReader(Sheet sheet, Class<T> recordClass) {
        this.sheet = sheet;
        this.recordClass = recordClass;
        this.currentRowIndex = 2; // first two rows of each sheet are headers
    }

    public T readNextRow() {
        if (currentRowIndex > sheet.getLastRowNum()) {
            return null;
        }

        RecordComponent[] components = recordClass.getRecordComponents();
        Object[] values = new Object[components.length];

        Row row = sheet.getRow(currentRowIndex);

        for (int i = 0; i < components.length; i++) {
            Cell cell = row.getCell(i);
            values[i] = getCorrectFormatFor(cell, components[i].getType());
        }

        try {
            Class<?>[] componentTypes = new Class<?>[components.length];
            for (int i = 0; i < components.length; i++) {
                componentTypes[i] = components[i].getType();
            }

            return recordClass.getDeclaredConstructor(componentTypes).newInstance(values);
        } catch (Exception e) {
            e.printStackTrace();
        }
        currentRowIndex++;
        return null;
    }

    private Object getCorrectFormatFor(Cell cell, Class<?> type) {
        if (cell == null)
            return null;
        if (type == String.class)
            return cell.getStringCellValue();
        if (type == int.class || type == Integer.class)
            return (int) cell.getNumericCellValue();
        if (type == double.class || type == Double.class)
            return cell.getNumericCellValue();
        if (type == boolean.class || type == Boolean.class)
            return cell.getBooleanCellValue();
        throw new IllegalArgumentException("Unsupported data type: " + type);
    }
}
