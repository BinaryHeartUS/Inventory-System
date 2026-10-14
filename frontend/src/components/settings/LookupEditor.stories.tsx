import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { LookupEditor } from "./LookupEditor";

const meta = {
  component: LookupEditor,
  args: {
    title: "Manufacturers",
    description: "Device manufacturers",
    values: ["Dell", "Lenovo"],
    loaded: true,
    error: null,
    onAdd: fn(),
    onRemove: fn(),
  },
} satisfies Meta<typeof LookupEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AddAndRemove: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByRole("textbox"), "  Apple  ");
    await userEvent.click(canvas.getByRole("button", { name: "Add" }));
    await expect(args.onAdd).toHaveBeenCalledWith("Apple");
    await expect(canvas.getByRole("textbox")).toHaveValue("");
    await userEvent.click(canvas.getByRole("button", { name: "Remove Dell" }));
    await expect(args.onRemove).toHaveBeenCalledWith("Dell");
  },
};
export const Duplicate: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByRole("textbox"), "dell");
    await userEvent.keyboard("{Enter}");
    await expect(args.onAdd).not.toHaveBeenCalled();
  },
};
export const KeyboardAdd: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByRole("textbox"), "Apple{Enter}");
    await expect(args.onAdd).toHaveBeenCalledWith("Apple");
  },
};
export const Blank: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByRole("textbox"), "   {Enter}");
    await expect(args.onAdd).not.toHaveBeenCalled();
  },
};
export const Empty: Story = { args: { values: [] } };
export const Loading: Story = { args: { loaded: false } };
export const Busy: Story = { args: { busy: true } };
export const Error: Story = { args: { error: "Unable to load options" } };
