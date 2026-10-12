import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { EditCombo, EditSelect, EditText } from "./EditField";

const meta = {
  component: EditText,
  args: { label: "Model", value: "", onChange: fn() },
} satisfies Meta<typeof EditText>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Text: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByTestId("edit-field-model"), "A");
    await expect(args.onChange).toHaveBeenLastCalledWith("A");
  },
};
export const Number: Story = { args: { type: "number", value: "42", min: 0, max: 100 } };
export const Date: Story = { args: { type: "date", value: "2026-01-15" } };
export const Select: Story = {
  render: () => (
    <EditSelect label="Status" value="New" options={["New", "Ready"]} onChange={fn()} />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("edit-field-status")).toHaveValue("New");
    await userEvent.selectOptions(canvas.getByRole("combobox"), "Ready");
  },
};
export const Combo: Story = {
  render: ({ onChange }) => (
    <EditCombo label="Model" value={null} options={["ThinkPad"]} onChange={onChange} />
  ),
  play: async ({ canvas, args }) => {
    await userEvent.selectOptions(canvas.getByRole("combobox"), "ThinkPad");
    await expect(args.onChange).toHaveBeenLastCalledWith("ThinkPad");
    await userEvent.selectOptions(canvas.getByRole("combobox"), "__custom__");
    await userEvent.type(canvas.getByRole("textbox"), "Custom model");
    await expect(args.onChange).toHaveBeenLastCalledWith("Custom model");
    await userEvent.clear(canvas.getByRole("textbox"));
    await expect(args.onChange).toHaveBeenLastCalledWith(null);
    await userEvent.selectOptions(canvas.getByRole("combobox"), "");
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  },
};
export const ExistingCustomValue: Story = {
  render: ({ onChange }) => (
    <EditCombo label="Model" value="Custom model" options={["ThinkPad"]} onChange={onChange} />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox")).toHaveValue("Custom model");
  },
};
