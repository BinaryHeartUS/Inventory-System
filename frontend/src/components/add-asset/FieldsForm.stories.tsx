import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { device, lookups, organization, person } from "../../stories/fixtures";
import { FieldsForm } from "./FieldsForm";
import { DEFAULT_FORM } from "./types";
import { changeFormControls } from "../../stories/interactions";

function StatefulForm(args: ComponentProps<typeof FieldsForm>) {
  const [form, setForm] = useState(args.form);
  return <FieldsForm {...args} form={form} setForm={setForm} />;
}
const meta = {
  component: FieldsForm,
  render: (args) => <StatefulForm {...args} />,
  args: {
    category: "Device",
    subtype: "Desktop",
    form: { ...DEFAULT_FORM, chapter: "Central" },
    setForm: fn(),
    lookups,
    selectedDevice: null,
    onOpenDevicePicker: fn(),
    onClearDevice: fn(),
    selectedParty: null,
    onOpenPartyPicker: fn(),
    onClearParty: fn(),
    selectedRecipient: null,
    onOpenRecipientPicker: fn(),
    onClearRecipient: fn(),
    onDeviceStatusChange: fn(),
  },
} satisfies Meta<typeof FieldsForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Desktop: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByTestId("field-model"), "ThinkPad");
    await expect(canvas.getByTestId("field-model")).toHaveValue("ThinkPad");
  },
};
export const Laptop: Story = { args: { subtype: "Laptop" } };
export const InvalidBattery: Story = {
  args: {
    subtype: "Laptop",
    form: { ...DEFAULT_FORM, designBatteryCapacity: "50", actualBatteryCapacity: "60" },
  },
};
export const Mobile: Story = { args: { subtype: "Tablet" } };
export const Tool: Story = { args: { category: "Tool", subtype: null } };
export const Misc: Story = { args: { category: "Misc", subtype: null } };
export const Part: Story = { args: { category: "Part", subtype: null } };
export const ContainedPart: Story = {
  args: {
    category: "Part",
    subtype: null,
    selectedDevice: device,
    form: { ...DEFAULT_FORM, wasPurchased: true },
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByTitle("Remove device link"));
    await expect(args.onClearDevice).toHaveBeenCalledOnce();
  },
};
export const DonorAndRecipient: Story = {
  args: {
    selectedParty: person,
    selectedRecipient: organization,
    form: { ...DEFAULT_FORM, status: "Donated" },
  },
};
export const DonationRequiresRecipient: Story = {
  args: { form: { ...DEFAULT_FORM, status: "Donated" } },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Select recipient/ }));
    await expect(args.onOpenRecipientPicker).toHaveBeenCalledOnce();
  },
};
export const EditAllDeviceFields: Story = {
  args: { subtype: "Laptop" },
  play: async ({ canvasElement }) => {
    await changeFormControls(canvasElement);
  },
};
export const EditPartFields: Story = {
  args: { category: "Part", subtype: null },
  play: async ({ canvasElement, canvas }) => {
    await changeFormControls(canvasElement);
    await expect(canvas.getByRole("radio", { name: "Purchased" })).toBeChecked();
  },
};
export const EditToolFields: Story = {
  args: { category: "Tool", subtype: null },
  play: async ({ canvasElement }) => {
    await changeFormControls(canvasElement);
  },
};
export const EditMiscFields: Story = {
  args: { category: "Misc", subtype: null },
  play: async ({ canvasElement }) => {
    await changeFormControls(canvasElement);
  },
};
