import { createRef } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
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
type Story = StoryObj<typeof meta>;
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
