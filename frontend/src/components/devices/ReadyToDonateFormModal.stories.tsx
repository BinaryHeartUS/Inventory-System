import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { ReadyToDonateFormModal } from "./ReadyToDonateFormModal";

const meta = {
  component: ReadyToDonateFormModal,
  args: { onConfirm: fn(), onCancel: fn() },
} satisfies Meta<typeof ReadyToDonateFormModal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Checklist: Story = {
  play: async ({ canvas, args }) => {
    const confirm = canvas.getByRole("button", { name: "Confirm" });
    await expect(confirm).toBeDisabled();
    for (const checkbox of canvas.getAllByRole("checkbox")) await userEvent.click(checkbox);
    await expect(confirm).toBeEnabled();
    await userEvent.click(canvas.getAllByRole("checkbox")[0]);
    await expect(confirm).toBeDisabled();
    await userEvent.click(canvas.getAllByRole("checkbox")[0]);
    await userEvent.click(confirm);
    await expect(args.onConfirm).toHaveBeenCalledOnce();
  },
};
export const Cancel: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
export const Backdrop: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(canvasElement.querySelector(".absolute")!);
    await expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
