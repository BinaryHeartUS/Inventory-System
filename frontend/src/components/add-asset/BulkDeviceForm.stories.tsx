import { useState } from "react";
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { lookups, person } from "../../stories/fixtures";
import { BulkDeviceForm } from "./BulkDeviceForm";
import { DEFAULT_BULK_FORM } from "./types";
import { changeFormControls } from "../../stories/interactions";

function StatefulForm(args: ComponentProps<typeof BulkDeviceForm>) {
  const [form, setForm] = useState(args.form);
  return <BulkDeviceForm {...args} form={form} setForm={setForm} />;
}
const meta = {
  component: BulkDeviceForm,
  render: (args) => <StatefulForm {...args} />,
  args: {
    form: { ...DEFAULT_BULK_FORM, chapter: "Central" },
    setForm: fn(),
    lookups,
    selectedParty: null,
    onOpenPartyPicker: fn(),
    onClearParty: fn(),
  },
} satisfies Meta<typeof BulkDeviceForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByTestId("field-number-of-devices"), "24");
    await expect(canvas.getByTestId("field-number-of-devices")).toHaveValue(24);
    await userEvent.selectOptions(canvas.getByTestId("field-device-type"), "Laptop");
    await expect(canvas.getByTestId("field-device-type")).toHaveValue("Laptop");
  },
};
export const Populated: Story = {
  args: {
    form: {
      ...DEFAULT_BULK_FORM,
      count: "24",
      manufacturer: "Dell",
      model: "Latitude",
      chapter: "Central",
    },
    selectedParty: person,
  },
};
export const EmptyLookups: Story = {
  args: { lookups: { ...lookups, chapters: [], manufacturers: [] } },
};
export const EditAllFields: Story = {
  play: async ({ canvasElement }) => {
    await changeFormControls(canvasElement);
  },
};
