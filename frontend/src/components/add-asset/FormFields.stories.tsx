import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { FCombo, FSelect, FText, Req } from "./FormFields";

const meta = {
  component: FText,
  args: { label: "Model", value: "", onChange: fn() },
} satisfies Meta<typeof FText>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Text: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByRole("textbox"), "A");
    await expect(args.onChange).toHaveBeenCalledWith("A");
  },
};
export const Required: Story = { args: { req: true, colSpan: true } };
export const Number: Story = { args: { type: "number", value: "1", min: 1, max: 100 } };
export const RequiredMarker: Story = { render: () => <Req /> };
export const Select: Story = {
  render: ({ onChange }) => (
    <FSelect
      label="Chapter"
      value="Central"
      options={["Central", "West"]}
      onChange={onChange}
      req
    />
  ),
  play: async ({ canvas, args }) => {
    await userEvent.selectOptions(canvas.getByRole("combobox"), "West");
    await expect(args.onChange).toHaveBeenCalledWith("West");
  },
};
export const Combo: Story = {
  render: ({ onChange }) => (
    <FCombo label="Model" value={null} options={["ThinkPad"]} onChange={onChange} req />
  ),
  play: async ({ canvas, args }) => {
    await userEvent.selectOptions(canvas.getByRole("combobox"), "ThinkPad");
    await expect(args.onChange).toHaveBeenLastCalledWith("ThinkPad");
    await userEvent.selectOptions(canvas.getByRole("combobox"), "__custom__");
    await userEvent.type(canvas.getByRole("textbox"), "Custom");
    await expect(args.onChange).toHaveBeenLastCalledWith("Custom");
    await userEvent.clear(canvas.getByRole("textbox"));
    await expect(args.onChange).toHaveBeenLastCalledWith(null);
    await userEvent.selectOptions(canvas.getByRole("combobox"), "");
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  },
};
export const CustomValue: Story = {
  render: ({ onChange }) => (
    <FCombo label="Model" value="Custom" options={["ThinkPad"]} onChange={onChange} />
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox")).toHaveValue("Custom");
  },
};
