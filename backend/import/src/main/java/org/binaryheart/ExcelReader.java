package org.binaryheart;

import java.io.File;
import java.util.List;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.binaryheart.records.Desktop;
import org.binaryheart.records.Donated;
import org.binaryheart.records.Laptop;
import org.binaryheart.records.Part;
import org.binaryheart.records.ReadyToDonate;
import org.binaryheart.records.Tablet;

public class ExcelReader {
    public static void main(String[] args) {
        String filePath = System.getenv("IMPORT_FILE_PATH") != null // Check if the environment variable is set, if not
                                                                    // use the default path
                ? System.getenv("IMPORT_FILE_PATH")
                : "data/OldInventorySystem.xlsx";
        Workbook workbook = readExcelFile(filePath);

        List<Laptop> laptops = getRecords("Laptops", workbook, Laptop.class);
        List<Tablet> tablets = getRecords("Tablets", workbook, Tablet.class);
        List<Desktop> desktops = getRecords("Desktops", workbook, Desktop.class);
        List<ReadyToDonate> readyToDonate = getRecords("Ready To Donate", workbook, ReadyToDonate.class);
        List<Donated> donated = getRecords("Donated", workbook, Donated.class);
        List<Part> parts = getRecords("Parts", workbook, Part.class);
    }

    private static <T extends Record> List<T> getRecords(String sheetName, Workbook workbook, Class<T> recordClass) {
        Sheet sheet = workbook.getSheet(sheetName);
        return SheetReader.readAllRows(sheet, recordClass);
    }

    private static Workbook readExcelFile(String filePath) {
        try (Workbook workbook = WorkbookFactory.create(new File(filePath), null, true)) {
            return workbook;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
