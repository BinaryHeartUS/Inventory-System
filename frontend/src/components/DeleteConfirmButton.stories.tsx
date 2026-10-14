import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { DeleteConfirmButton } from "./DeleteConfirmButton";

const meta = {
  component: DeleteConfirmButton,
  args: { noun: "device", showing: false, onShowConfirm: fn(), onConfirm: fn(), onCancel: fn() },
} satisfies Meta<typeof DeleteConfirmButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete" }));
    await expect(args.onShowConfirm).toHaveBeenCalledOnce();
  },
};
export const Confirmation: Story = {
  args: { showing: true },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Confirm" }));
    await expect(args.onConfirm).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
export const Disabled: Story = {
  args: { disabled: true, disabledTitle: "Viewer accounts cannot delete devices." },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
};
