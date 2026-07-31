package org.binaryheart;

import java.time.LocalDate;
import org.binaryheart.requests.InsertDesktopRequest;
import org.binaryheart.requests.InsertLaptopRequest;
import org.binaryheart.requests.InsertPartRequest;
import org.binaryheart.requests.InsertTabletRequest;
import org.binaryheart.requests.InsertToolRequest;
import org.binaryheart.responses.GetDeviceResponse;
import org.binaryheart.responses.GetToolResponse;
import org.binaryheart.responses.PartResponse;

public final class TestFixtures {

	private TestFixtures() {
	}

	public static InsertDesktopRequest desktop() {
		return new InsertDesktopRequest(2, "Dell", "OptiPlex", 2020, "Not Started", 101, "i5", 16, "DDR4", 512, "SSD",
			250.0, LocalDate.of(2024, 1, 1), null, null, true, "Windows 11");
	}

	public static InsertLaptopRequest laptop() {
		return new InsertLaptopRequest(2, "Lenovo", "ThinkPad", 2021, "In Progress", "Included", 102, "i7", 16, "DDR4",
			512, "SSD", 350.0, LocalDate.of(2024, 1, 1), null, null, 5000, 4500, "Windows 11");
	}

	public static InsertTabletRequest tablet() {
		return new InsertTabletRequest(2, "Apple", "iPad", 2022, "Ready To Donate", "Included", 103, "M1", 8, "LPDDR4",
			256, "Flash", 400.0, LocalDate.of(2024, 1, 1), null, null, "Working", "iPad OS");
	}

	public static InsertPartRequest part() {
		return new InsertPartRequest(2, "RAM", "16 GB DDR4", true, null, 201, LocalDate.of(2024, 1, 1), 30.0, null);
	}

	public static InsertToolRequest tool() {
		return new InsertToolRequest(2, 301, "Screwdriver", LocalDate.of(2024, 1, 1), 10.0, null);
	}

	public static GetDeviceResponse device() {
		return new GetDeviceResponse("Desktop", 101, LocalDate.of(2024, 1, 1), 250.0, "Dell", "OptiPlex", 2020, "i5",
			16, "DDR4", 512, "SSD", "Not Started", true, null, null, null, null, null, "Chapter Two", null,
			"Windows 11", null, null);
	}

	public static PartResponse partResponse() {
		return new PartResponse(201, "RAM", "16 GB DDR4", true, null, 2, "2024-01-01", 30.0, null);
	}

	public static GetToolResponse toolResponse() {
		return new GetToolResponse(301, LocalDate.of(2024, 1, 1), 10.0, "Screwdriver", 2, null);
	}
}
