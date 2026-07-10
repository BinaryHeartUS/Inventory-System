package org.binaryheart;

import java.lang.reflect.RecordComponent;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.binaryheart.enums.*;

public class SheetReader<T extends Record> {

	public static <T extends Record> List<T> readAllRows(Sheet sheet, Class<T> recordClass) {
		int totalRows = sheet.getLastRowNum();
		if (totalRows < 2) {
			throw new IllegalStateException("Sheet does not contain any data rows.");
		}

		List<T> records = new ArrayList<>();

		for (int i = 2; i <= totalRows; i++) { // i starts at 2 to skip header rows
			T record = readRow(sheet, recordClass, i);
			if (record != null) {
				records.add(record);
			}
		}
		return records;
	}

	public static <T extends Record> T readRow(Sheet sheet, Class<T> recordClass, int rowIndex) {
		RecordComponent[] components = recordClass.getRecordComponents();
		Object[] values = new Object[components.length];

		Row row = sheet.getRow(rowIndex);

		if (row == null) {
			return null;
		}

		for (int i = 0; i < components.length; i++) {
			Cell cell = row.getCell(i);
			values[i] = getCorrectFormatFor(cell, components[i].getType());
			if (i == 0 && (values[i] == null || (values[i] instanceof String str && str.strip().equals("")))) {
				return null;
			}
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

		return null;
	}

	private static final DataFormatter DATA_FORMATTER = new DataFormatter();

	private static Object getCorrectFormatFor(Cell cell, Class<?> type) {
		if (cell == null)
			return null;
		if (type == String.class) {
			if (cell.getCellType() == CellType.NUMERIC) {
				return DATA_FORMATTER.formatCellValue(cell);
			}
			return cell.getStringCellValue();
		}
		if (type == int.class || type == Integer.class)
			return (int) cell.getNumericCellValue();
		if (type == double.class || type == Double.class)
			return cell.getNumericCellValue();
		if (type == boolean.class || type == Boolean.class)
			return cell.getBooleanCellValue();
		if (type == LocalDate.class) {
			LocalDateTime ldt = cell.getLocalDateTimeCellValue();
			return ldt == null ? null : ldt.toLocalDate();
		}

		if (type.isEnum()) {
			String cellValue = cell.getStringCellValue().toUpperCase().replace(" ", "_");
			if (cellValue.isEmpty())
				return null;
			if (type == OperatingSystem.class)
				return OperatingSystem.valueOf(cellValue);
			if (type == Status.class)
				return Status.valueOf(cellValue);
			if (type == TypeOfDevice.class)
				return TypeOfDevice.valueOf(cellValue);
			if (type == ChargerStatus.class)
				return ChargerStatus.valueOf(cellValue);
			if (type == WorkingBattery.class)
				return WorkingBattery.valueOf(cellValue);
		}

		throw new IllegalArgumentException("Unsupported data type: " + type);
	}
}
