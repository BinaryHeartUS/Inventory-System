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

        String filePath = getFilePath();

        try (Workbook workbook = readExcelFile(filePath)) {
            if (workbook == null) {
                System.err.println("Failed to open workbook at: " + filePath);
                return;
            }

            if (!DatabaseConnectionService.isConnected()) {
                DatabaseConnectionService.connect();
            }

            int chapterId = DatabaseImporter.addChapter("Rose-Hulman Institute of Technology");

            importDesktops(workbook, chapterId);
            importLaptops(workbook, chapterId);
            importTablets(workbook, chapterId);
            importReadyToDonate(workbook, chapterId);
            importDonated(workbook, chapterId);
            importParts(workbook, chapterId);

            if (DatabaseConnectionService.isConnected()) {
                DatabaseConnectionService.closeConnection();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static <T extends Record> List<T> getRecords(String sheetName, Workbook workbook, Class<T> recordClass) {
        Sheet sheet = workbook.getSheet(sheetName);
        return SheetReader.readAllRows(sheet, recordClass);
    }

    private static Workbook readExcelFile(String filePath) {
        try {
            return WorkbookFactory.create(new File(filePath), null, true);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private static String getFilePath() {
        return System.getenv("IMPORT_FILE_PATH") != null ? System.getenv("IMPORT_FILE_PATH")
                : "data/OldInventorySystem.xlsx";
    }

    private static void importDesktops(Workbook workbook, int chapterId) {
        List<Desktop> desktops = getRecords("Desktops", workbook, Desktop.class);
        DatabaseImporter.addDesktopsToDatabase(desktops, chapterId);
    }

    private static void importLaptops(Workbook workbook, int chapterId) {
        List<Laptop> laptops = getRecords("Laptops", workbook, Laptop.class);
    }

    private static void importTablets(Workbook workbook, int chapterId) {
        List<Tablet> tablets = getRecords("Tablets", workbook, Tablet.class);
    }

    private static void importReadyToDonate(Workbook workbook, int chapterId) {
        List<ReadyToDonate> readyToDonate = getRecords("Ready To Donate", workbook, ReadyToDonate.class);
    }

    private static void importDonated(Workbook workbook, int chapterId) {
        List<Donated> donated = getRecords("Donated", workbook, Donated.class);
    }

    private static void importParts(Workbook workbook, int chapterId) {
        List<Part> parts = getRecords("Parts", workbook, Part.class);
    }
}
