import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import DiscardChangesDialog from "./DiscardChangesDialog";

const meta = {
  component: DiscardChangesDialog,
  args: { onKeepEditing: fn(), onDiscard: fn() },
} satisfies Meta<typeof DiscardChangesDialog>;
export default meta;
type Story = StoryObj<typeof meta>;
export const KeepEditing: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole("dialog")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Keep editing" }));
    await expect(args.onKeepEditing).toHaveBeenCalledOnce();
  },
};
export const Discard: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Discard changes" }));
    await expect(args.onDiscard).toHaveBeenCalledOnce();
  },
};
export const Backdrop: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(canvasElement.querySelector(".absolute")!);
    await expect(args.onKeepEditing).toHaveBeenCalledOnce();
  },
};
