import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { SoldValueModal } from "./SoldValueModal";

const meta = {
  component: SoldValueModal,
  args: { initialValue: null, onConfirm: fn(), onCancel: fn() },
} satisfies Meta<typeof SoldValueModal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const EnterValue: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole("button", { name: "Confirm sale" })).toBeDisabled();
    await userEvent.type(canvas.getByRole("spinbutton"), "150.25");
    await userEvent.click(canvas.getByRole("button", { name: "Confirm sale" }));
    await expect(args.onConfirm).toHaveBeenCalledWith(150.25);
  },
};
export const Zero: Story = {
  args: { initialValue: 0 },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Confirm sale" }));
    await expect(args.onConfirm).toHaveBeenCalledWith(0);
  },
};
export const ExistingValue: Story = { args: { initialValue: "150" } };
export const Negative: Story = {
  args: { initialValue: -1 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Confirm sale" })).toBeDisabled();
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
