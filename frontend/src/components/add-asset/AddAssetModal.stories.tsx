import { createRef } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { device, lookups, organization, person } from "../../stories/fixtures";
import { DevicePickerModal } from "../devices/DevicePickerModal";
import { PartyPickerModal } from "../parties/PartyPickerModal";
import { AddAssetModal } from "./AddAssetModal";

function PartyPicker(
  props: ComponentProps<NonNullable<ComponentProps<typeof AddAssetModal>["partyPickerComponent"]>>
) {
  return (
    <PartyPickerModal
      {...props}
      parties={[person, organization]}
      loading={false}
      onCreate={async () => {}}
    />
  );
}
function DevicePicker(
  props: ComponentProps<NonNullable<ComponentProps<typeof AddAssetModal>["devicePickerComponent"]>>
) {
  return (
    <DevicePickerModal
      {...props}
      devices={[device]}
      loading={false}
      initialLoading={false}
      search=""
      onSearchChange={fn()}
      sentinelRef={createRef<HTMLDivElement>()}
    />
  );
}
const meta = {
  component: AddAssetModal,
  args: {
    lookups,
    chapterList: [
      { id: 1, name: "Central" },
      { id: 2, name: "West" },
    ],
    checkAssetId: fn(async () => false),
    onAdd: fn(),
    onBulkAdd: fn(),
    onCancel: fn(),
    partyPickerComponent: PartyPicker,
    devicePickerComponent: DevicePicker,
  },
} satisfies Meta<typeof AddAssetModal>;
export default meta;
type Story = StoryObj<typeof AddAssetModal>;
const category: NonNullable<Story["play"]> = async ({ canvas }) => {
  await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
};
async function chooseDevice(
  canvas: Parameters<NonNullable<Story["play"]>>[0]["canvas"],
  subtype: string
) {
  await userEvent.click(canvas.getByRole("button", { name: /^Device Desktop/ }));
  await userEvent.click(canvas.getByRole("button", { name: new RegExp(`^${subtype} `) }));
  await userEvent.selectOptions(canvas.getByTestId("field-manufacturer"), "Dell");
  await userEvent.type(canvas.getByTestId("field-model"), "Latitude");
}
async function choosePart(canvas: Parameters<NonNullable<Story["play"]>>[0]["canvas"]) {
  await userEvent.click(canvas.getByRole("button", { name: /^Part RAM/ }));
  await userEvent.selectOptions(canvas.getByTestId("field-part-type"), "RAM");
  await userEvent.type(canvas.getByTestId("field-description"), "  8GB RAM  ");
}
async function cancelPicker(
  canvas: Parameters<NonNullable<Story["play"]>>[0]["canvas"],
  title: string
) {
  const dialog = canvas.getByRole("heading", { name: title }).closest<HTMLElement>(".relative")!;
  await userEvent.click(within(dialog).getByRole("button", { name: "" }));
  await expect(canvas.queryByRole("heading", { name: title })).not.toBeInTheDocument();
}
async function replaceInput(input: HTMLElement, value: string) {
  await userEvent.clear(input);
  if (value) await userEvent.type(input, value);
}
async function chooseBulk(canvas: Parameters<NonNullable<Story["play"]>>[0]["canvas"]) {
  await userEvent.click(canvas.getByRole("button", { name: /^Bulk device import/ }));
  await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
  await userEvent.click(canvas.getByRole("button", { name: "I Understand, Continue" }));
}
const pendingIdChecks = new Map<number, (exists: boolean) => void>();
export const StaleIdChecks: Story = {
  args: {
    checkAssetId: fn(
      (id: number) => new Promise<boolean>((resolve) => pendingIdChecks.set(id, resolve))
    ),
  },
  beforeEach: () => {
    pendingIdChecks.clear();
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /^Input an ID/ }));
    await userEvent.type(canvas.getByTestId("asset-id"), "42");
    await expect(args.checkAssetId).toHaveBeenCalledWith(42);
    await replaceInput(canvas.getByTestId("asset-id"), "43");
    await waitFor(() => expect(pendingIdChecks.has(43)).toBe(true));
    pendingIdChecks.get(43)!(true);
    await expect(await canvas.findByText("ID 43 is already in use.")).toBeVisible();
    pendingIdChecks.get(42)!(false);
    await expect(canvas.getByText("ID 43 is already in use.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Continue" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: /^Generate an ID/ }));
    await expect(canvas.queryByTestId("asset-id")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Continue" })).toBeEnabled();
  },
};
export const InvalidIdInputMethods: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /^Input an ID/ }));
    const input = canvas.getByTestId("asset-id");
    await userEvent.click(input);
    await userEvent.keyboard("eE+-.");
    await expect(input).toHaveValue(null);
    for (const value of ["-1", "1.5"]) {
      fireEvent.change(input, { target: { value } });
      await expect(canvas.getByText("ID must be a positive whole number.")).toBeVisible();
      await expect(canvas.getByRole("button", { name: "Continue" })).toBeDisabled();
    }
    await expect(args.checkAssetId).not.toHaveBeenCalled();
  },
};
export const BulkValidationBoundaries: Story = {
  play: async ({ canvas, canvasElement, args }) => {
    await chooseBulk(canvas);
    const submit = canvas.getByRole("button", { name: "Add Devices" });
    await userEvent.type(canvas.getByTestId("field-number-of-devices"), "1");
    await expect(submit).toBeDisabled();
    await userEvent.selectOptions(canvas.getByTestId("field-manufacturer"), "Dell");
    await expect(submit).toBeDisabled();
    await userEvent.type(canvas.getByTestId("field-model"), "Latitude");
    await expect(submit).toBeEnabled();
    for (const value of ["0", "1.5", "101", ""]) {
      await replaceInput(canvas.getByTestId("field-number-of-devices"), value);
      await expect(submit).toBeDisabled();
    }
    for (const value of ["1", "100"]) {
      await replaceInput(canvas.getByTestId("field-number-of-devices"), value);
      await expect(submit).toBeEnabled();
    }
    for (const value of ["1979", String(new Date().getFullYear() + 1), "2020.5", ""]) {
      await replaceInput(canvas.getByTestId("field-year"), value);
      await expect(submit).toBeDisabled();
    }
    await replaceInput(canvas.getByTestId("field-year"), "1980");
    await expect(submit).toBeEnabled();
    await replaceInput(canvas.getByTestId("field-model"), "   ");
    await expect(submit).toBeDisabled();
    await replaceInput(canvas.getByTestId("field-model"), "Latitude");
    await userEvent.selectOptions(canvas.getByTestId("field-manufacturer"), "");
    await expect(submit).toBeDisabled();
    await userEvent.selectOptions(canvas.getByTestId("field-manufacturer"), "Dell");
    const date = canvasElement.querySelector('input[type="date"]')!;
    fireEvent.change(date, { target: { value: "" } });
    await expect(submit).toBeDisabled();
    await userEvent.click(submit);
    await expect(args.onBulkAdd).not.toHaveBeenCalled();
    fireEvent.change(date, { target: { value: "2026-01-15" } });
    await expect(submit).toBeEnabled();
  },
};
export const BulkWithDonor: Story = {
  play: async ({ canvas, canvasElement, args }) => {
    await chooseBulk(canvas);
    await userEvent.type(canvas.getByTestId("field-number-of-devices"), "100");
    await userEvent.selectOptions(canvas.getByTestId("field-device-type"), "Laptop");
    await userEvent.selectOptions(canvas.getByTestId("field-manufacturer"), "__custom__");
    await userEvent.type(canvas.getByTestId("field-manufacturer-custom"), "  Framework  ");
    await userEvent.type(canvas.getByTestId("field-model"), "  Laptop 13  ");
    await replaceInput(canvas.getByTestId("field-year"), "1980");
    await userEvent.selectOptions(canvas.getByTestId("field-chapter"), "West");
    fireEvent.change(canvasElement.querySelector('input[type="date"]')!, {
      target: { value: "2026-01-15" },
    });
    await userEvent.click(canvas.getByRole("button", { name: "Select donor (optional)" }));
    await userEvent.click(canvas.getByText(person.name));
    await userEvent.click(canvas.getByTitle("Remove donor"));
    await userEvent.click(canvas.getByRole("button", { name: "Select donor (optional)" }));
    await userEvent.click(canvas.getByText(organization.name));
    await userEvent.click(canvas.getByRole("button", { name: "Add Devices" }));
    await expect(args.onBulkAdd).toHaveBeenCalledWith({
      count: 100,
      type: "Laptop",
      chapterId: 2,
      manufacturer: "Framework",
      model: "Laptop 13",
      year: 1980,
      donorId: organization.id,
      acquisitionDate: "2026-01-15",
    });
  },
};
export const BulkBackNavigation: Story = {
  play: async ({ canvas }) => {
    await chooseBulk(canvas);
    await userEvent.type(canvas.getByTestId("field-number-of-devices"), "5");
    await userEvent.click(canvas.getByRole("button", { name: "Back" }));
    await expect(canvas.getByText("Before you continue")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Back" }));
    await expect(canvas.getByText("How should this asset's ID be assigned?")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
    await userEvent.click(canvas.getByRole("button", { name: "I Understand, Continue" }));
    await expect(canvas.getByTestId("field-number-of-devices")).toHaveValue(5);
  },
};
export const DonatedRecipientManagement: Story = {
  play: async (context) => {
    const { canvas, args } = context;
    await category(context);
    await chooseDevice(canvas, "Laptop");
    await userEvent.selectOptions(canvas.getByTestId("field-status"), "Donated");
    await cancelPicker(canvas, "Select a Donor");
    await expect(canvas.getByRole("button", { name: "Add Asset" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Select recipient (required)" }));
    await userEvent.click(canvas.getByText(person.name));
    await expect(canvas.getByRole("button", { name: "Add Asset" })).toBeEnabled();
    await userEvent.click(canvas.getByTitle("Remove recipient"));
    await expect(canvas.getByRole("button", { name: "Add Asset" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Select recipient (required)" }));
    await userEvent.click(canvas.getByText(organization.name));
    await userEvent.selectOptions(canvas.getByTestId("field-status"), "In Progress");
    await expect(canvas.queryByTitle("Remove recipient")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Add Asset" }));
    await expect(args.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ status: "In Progress", recipientId: null })
    );
  },
};
export const SaleClearsRecipient: Story = {
  play: async (context) => {
    const { canvas, args } = context;
    await category(context);
    await chooseDevice(canvas, "Desktop");
    await userEvent.click(canvas.getByRole("button", { name: "Select recipient (optional)" }));
    await userEvent.click(canvas.getByText(organization.name));
    await userEvent.selectOptions(canvas.getByTestId("field-status"), "Sold");
    await userEvent.type(canvas.getByLabelText("Sale value ($)"), "0");
    await userEvent.click(canvas.getByRole("button", { name: "Confirm sale" }));
    await expect(canvas.queryByTitle("Remove recipient")).not.toBeInTheDocument();
    await userEvent.clear(canvas.getByTestId("field-value"));
    await expect(canvas.getByRole("button", { name: "Add Asset" })).toBeDisabled();
    await userEvent.type(canvas.getByTestId("field-value"), "-1");
    await expect(canvas.getByRole("button", { name: "Add Asset" })).toBeDisabled();
    await replaceInput(canvas.getByTestId("field-value"), "0");
    await userEvent.click(canvas.getByRole("button", { name: "Add Asset" }));
    await expect(args.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ status: "Sold", value: 0, recipientId: null })
    );
  },
};
export const PopulatedLaptopPayload: Story = {
  args: { scanId: 900 },
  play: async ({ canvas, canvasElement, args }) => {
    await chooseDevice(canvas, "Laptop");
    await userEvent.type(canvas.getByTestId("field-serial-number"), "  S123  ");
    await userEvent.type(canvas.getByTestId("field-cpu"), "  Core i5  ");
    await replaceInput(canvas.getByTestId("field-year"), "2022");
    await userEvent.type(canvas.getByTestId("field-ram-gb"), "16");
    await userEvent.selectOptions(canvas.getByTestId("field-ram-generation"), "DDR4");
    await userEvent.type(canvas.getByTestId("field-storage-gb"), "512");
    await userEvent.selectOptions(canvas.getByTestId("field-storage-type"), "SSD");
    await userEvent.selectOptions(canvas.getByTestId("field-operating-system"), "Linux");
    await userEvent.selectOptions(canvas.getByTestId("field-chapter"), "West");
    await userEvent.type(canvas.getByTestId("field-value"), "80");
    await userEvent.type(canvas.getByTestId("field-design-capacity-wh"), "50");
    await userEvent.type(canvas.getByTestId("field-actual-capacity-wh"), "50");
    await userEvent.selectOptions(canvas.getByTestId("field-charger"), "Included");
    fireEvent.change(canvasElement.querySelector('input[type="date"]')!, {
      target: { value: "2026-01-15" },
    });
    await userEvent.click(canvas.getByRole("button", { name: "Select donor (optional)" }));
    await userEvent.click(canvas.getByText(person.name));
    await userEvent.click(canvas.getByRole("button", { name: "Add Asset" }));
    await expect(args.onAdd).toHaveBeenCalledWith({
      id: 900,
      type: "Laptop",
      manufacturer: "Dell",
      model: "Latitude",
      serialNumber: "S123",
      cpu: "Core i5",
      year: 2022,
      ram: 16,
      ramGeneration: "DDR4",
      storage: 512,
      storageType: "SSD",
      operatingSystem: "Linux",
      chapter: "West",
      status: "Not Started",
      acquisitionDate: "2026-01-15",
      donatedDate: null,
      value: 80,
      donorId: person.id,
      recipientId: null,
      deviceStuck: false,
      includesCharger: "Included",
      designBatteryCapacity: 50,
      actualBatteryCapacity: 50,
      batteryHealth: null,
    });
  },
};
export const MissingChapters: Story = {
  args: { scanId: 42, lookups: { ...lookups, chapters: [] } },
  play: async ({ canvas, args }) => {
    await chooseDevice(canvas, "Desktop");
    await expect(canvas.getByRole("button", { name: "Add Asset" })).toBeDisabled();
    await expect(args.onAdd).not.toHaveBeenCalled();
  },
};
export const ScannedMiscValidation: Story = {
  args: { scanId: 999 },
  play: async ({ canvas, canvasElement, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /^Misc Bulk/ }));
    const submit = canvas.getByRole("button", { name: "Add Asset" });
    await userEvent.type(canvas.getByTestId("field-description"), "  Cables  ");
    await expect(submit).toBeDisabled();
    await userEvent.type(canvas.getByTestId("field-value"), "0");
    await expect(submit).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Select donor" }));
    await userEvent.click(canvas.getByText(person.name));
    await expect(submit).toBeEnabled();
    await userEvent.click(canvas.getByTitle("Remove donor"));
    await expect(submit).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Select donor" }));
    await userEvent.click(canvas.getByText(organization.name));
    fireEvent.change(canvasElement.querySelector('input[type="date"]')!, {
      target: { value: "2026-01-15" },
    });
    await userEvent.click(submit);
    await expect(args.onAdd).toHaveBeenCalledWith({
      id: 999,
      description: "Cables",
      value: 0,
      donorId: organization.id,
      acquisitionDate: "2026-01-15",
    });
  },
};
export const ScannedLinkedPart: Story = {
  args: { scanId: 812 },
  play: async ({ canvas, canvasElement, args }) => {
    await choosePart(canvas);
    await userEvent.click(canvas.getByRole("radio", { name: "Purchased" }));
    await userEvent.click(canvas.getByRole("button", { name: "Select device (optional)" }));
    await expect(canvas.getByText("Showing devices in", { exact: false })).toBeVisible();
    await userEvent.click(canvas.getByText("ThinkPad"));
    await expect(
      canvas.queryByRole("heading", { name: "Select a Device" })
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Select donor (optional)" }));
    await userEvent.click(canvas.getByText(organization.name));
    await userEvent.type(canvas.getByTestId("field-value"), "29.99");
    fireEvent.change(canvasElement.querySelector('input[type="date"]')!, {
      target: { value: "2026-01-15" },
    });
    await userEvent.click(canvas.getByRole("button", { name: "Add Asset" }));
    await expect(args.onAdd).toHaveBeenCalledWith({
      id: 812,
      type: "RAM",
      description: "8GB RAM",
      wasPurchased: true,
      containedIn: device.id,
      chapterId: 1,
      acquisitionDate: "2026-01-15",
      value: 29.99,
      donorId: organization.id,
    });
  },
};
export const RemovePartLinks: Story = {
  play: async (context) => {
    const { canvas, args } = context;
    await category(context);
    await choosePart(canvas);
    await userEvent.click(canvas.getByRole("button", { name: "Select device (optional)" }));
    await userEvent.click(canvas.getByText("ThinkPad"));
    await userEvent.click(canvas.getByTitle("Remove device link"));
    await expect(canvas.getByRole("button", { name: "Select device (optional)" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Select donor (optional)" }));
    await userEvent.click(canvas.getByText(person.name));
    await userEvent.click(canvas.getByTitle("Remove donor"));
    await userEvent.click(canvas.getByRole("button", { name: "Add Asset" }));
    await expect(args.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ id: 0, containedIn: null, donorId: null })
    );
  },
};
export const ChangingChapterClearsDeviceLink: Story = {
  play: async (context) => {
    const { canvas, args } = context;
    await category(context);
    await choosePart(canvas);
    await userEvent.click(canvas.getByRole("button", { name: "Select device (optional)" }));
    await userEvent.click(canvas.getByText("ThinkPad"));
    await userEvent.selectOptions(canvas.getByTestId("field-chapter"), "West");
    await expect(canvas.queryByTitle("Remove device link")).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Add Asset" }));
    await expect(args.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ chapterId: 2, containedIn: null })
    );
  },
};
export const CancelPickers: Story = {
  play: async (context) => {
    const { canvas, args } = context;
    await category(context);
    await choosePart(canvas);
    await userEvent.click(canvas.getByRole("button", { name: "Select device (optional)" }));
    await cancelPicker(canvas, "Select a Device");
    await userEvent.click(canvas.getByRole("button", { name: "Select donor (optional)" }));
    await cancelPicker(canvas, "Select a Donor");
    await expect(args.onCancel).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "Back" }));
    await expect(canvas.getByText("What type of asset is this?")).toBeVisible();
  },
};
export const CancelSaleValue: Story = {
  play: async (context) => {
    const { canvas, args } = context;
    await category(context);
    await chooseDevice(canvas, "Desktop");
    await userEvent.selectOptions(canvas.getByTestId("field-status"), "Sold");
    await userEvent.click(
      within(canvas.getByRole("dialog", { name: "Sold Device" })).getByRole("button", {
        name: "Cancel",
      })
    );
    await expect(canvas.queryByRole("dialog", { name: "Sold Device" })).not.toBeInTheDocument();
    await expect(canvas.getByTestId("field-status")).toHaveValue("Not Started");
    await userEvent.click(canvas.getByRole("button", { name: "Add Asset" }));
    await expect(args.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ status: "Not Started", value: null })
    );
  },
};
export const GeneratedId: Story = { play: category };
export const ManualId: Story = {
  play: async (context) => {
    const { canvas, args } = context;
    await userEvent.click(canvas.getByRole("button", { name: /^Input an ID/ }));
    await expect(canvas.getByRole("button", { name: "Continue" })).toBeDisabled();
    await userEvent.type(canvas.getByTestId("asset-id"), "42");
    await expect(args.checkAssetId).toHaveBeenCalledWith(42);
    await category(context);
  },
};
export const ConflictingId: Story = {
  args: { checkAssetId: fn(async () => true) },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /^Input an ID/ }));
    await userEvent.type(canvas.getByTestId("asset-id"), "42");
    await expect(canvas.getByText("ID 42 is already in use.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Continue" })).toBeDisabled();
  },
};
export const InvalidId: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /^Input an ID/ }));
    await userEvent.type(canvas.getByTestId("asset-id"), "0");
    await expect(canvas.getByText("ID must be a positive whole number.")).toBeVisible();
  },
};
export const ScannedId: Story = { args: { scanId: 42 } };
export const Desktop: Story = {
  play: async (context) => {
    await category(context);
    await chooseDevice(context.canvas, "Desktop");
    await userEvent.click(context.canvas.getByRole("button", { name: "Add Asset" }));
    await expect(context.args.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ type: "Desktop", manufacturer: "Dell", model: "Latitude" })
    );
  },
};
export const Laptop: Story = {
  play: async (context) => {
    await category(context);
    await chooseDevice(context.canvas, "Laptop");
    await userEvent.click(context.canvas.getByRole("button", { name: "Add Asset" }));
    await expect(context.args.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ type: "Laptop" })
    );
  },
};
export const Mobile: Story = {
  play: async (context) => {
    await category(context);
    await chooseDevice(context.canvas, "Mobile Device");
    await userEvent.click(context.canvas.getByRole("button", { name: "Add Asset" }));
    await expect(context.args.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ type: "Tablet" })
    );
  },
};
export const Tool: Story = {
  play: async (context) => {
    await category(context);
    await userEvent.click(context.canvas.getByRole("button", { name: /^Tool Screwdriver/ }));
    await userEvent.type(context.canvas.getByTestId("field-description"), "Screwdriver");
    await userEvent.click(context.canvas.getByRole("button", { name: "Add Asset" }));
    await expect(context.args.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Screwdriver", chapterId: 1 })
    );
  },
};
export const Part: Story = {
  play: async (context) => {
    await category(context);
    await userEvent.click(context.canvas.getByRole("button", { name: /^Part RAM/ }));
    await userEvent.selectOptions(context.canvas.getByTestId("field-part-type"), "RAM");
    await userEvent.type(context.canvas.getByTestId("field-description"), "8GB RAM");
    await userEvent.click(context.canvas.getByRole("button", { name: "Add Asset" }));
    await expect(context.args.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ type: "RAM", description: "8GB RAM" })
    );
  },
};
export const MiscDonation: Story = {
  play: async (context) => {
    const { canvas, args } = context;
    await category(context);
    await userEvent.click(canvas.getByRole("button", { name: /^Misc Bulk/ }));
    await userEvent.type(canvas.getByTestId("field-description"), "Cables");
    await userEvent.type(canvas.getByTestId("field-value"), "100");
    await userEvent.click(canvas.getByRole("button", { name: "Select donor" }));
    await userEvent.click(canvas.getByText(person.name));
    await userEvent.click(canvas.getByRole("button", { name: "Add Asset" }));
    await expect(args.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Cables", value: 100, donorId: 1 })
    );
  },
};
export const BulkImport: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /^Bulk device import/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
    await userEvent.click(canvas.getByRole("button", { name: "I Understand, Continue" }));
    await expect(canvas.getByRole("button", { name: "Add Devices" })).toBeDisabled();
    await userEvent.type(canvas.getByTestId("field-number-of-devices"), "24");
    await userEvent.selectOptions(canvas.getByTestId("field-manufacturer"), "Dell");
    await userEvent.type(canvas.getByTestId("field-model"), "Latitude");
    await userEvent.click(canvas.getByRole("button", { name: "Add Devices" }));
    await expect(args.onBulkAdd).toHaveBeenCalledWith(
      expect.objectContaining({ count: 24, type: "Desktop", chapterId: 1 })
    );
  },
};
export const BackNavigation: Story = {
  play: async (context) => {
    await category(context);
    await userEvent.click(context.canvas.getByRole("button", { name: /^Device Desktop/ }));
    await userEvent.click(context.canvas.getByRole("button", { name: /^Laptop / }));
    await userEvent.click(context.canvas.getByRole("button", { name: "Back" }));
    await expect(context.canvas.getByText("What kind of device is this?")).toBeVisible();
    await userEvent.click(context.canvas.getByRole("button", { name: "Back" }));
    await expect(context.canvas.getByText("What type of asset is this?")).toBeVisible();
  },
};
export const Cancel: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
export const SoldDevice: Story = {
  play: async (context) => {
    const { canvas, args } = context;
    await category(context);
    await chooseDevice(canvas, "Desktop");
    await userEvent.selectOptions(canvas.getByTestId("field-status"), "Sold");
    await userEvent.type(canvas.getByLabelText("Sale value ($)"), "150");
    await userEvent.click(canvas.getByRole("button", { name: "Confirm sale" }));
    await userEvent.click(canvas.getByRole("button", { name: "Add Asset" }));
    await expect(args.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ status: "Sold", value: 150 })
    );
  },
};
export const DonatedDevice: Story = {
  play: async (context) => {
    const { canvas, args } = context;
    await category(context);
    await chooseDevice(canvas, "Laptop");
    await userEvent.selectOptions(canvas.getByTestId("field-status"), "Donated");
    await userEvent.click(canvas.getByText(organization.name));
    await userEvent.click(canvas.getByRole("button", { name: "Add Asset" }));
    await expect(args.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ status: "Donated", recipientId: 2 })
    );
  },
};
export const InvalidBattery: Story = {
  play: async (context) => {
    const { canvas } = context;
    await category(context);
    await chooseDevice(canvas, "Laptop");
    await userEvent.type(canvas.getByTestId("field-design-capacity-wh"), "50");
    await userEvent.type(canvas.getByTestId("field-actual-capacity-wh"), "60");
    await expect(canvas.getByRole("button", { name: "Add Asset" })).toBeDisabled();
  },
};
