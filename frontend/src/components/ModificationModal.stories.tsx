import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { ModificationModal } from "./ModificationModal";

const meta = {
  component: ModificationModal,
  args: {
    entry: {
      assetId: 42,
      changeType: "Update",
      modifiedAt: "2026-01-15T12:00:00Z",
      modifiedBy: "Alex",
    },
    fields: [
      { label: "Model", old: "ThinkPad", new: "Latitude" },
      { label: "Serial", old: null, new: "ABC" },
      { label: "Notes", old: "Removed", new: null },
    ],
    onClose: fn(),
  },
} satisfies Meta<typeof ModificationModal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Update: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText("Model (before)")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
export const Insert: Story = { args: { entry: { assetId: 42, changeType: "Insert" } } };
export const Delete: Story = { args: { entry: { assetId: 42, changeType: "Delete" } } };
export const EmptySnapshot: Story = {
  args: { entry: { assetId: 42, changeType: "Insert" }, fields: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No field data recorded.")).toBeVisible();
  },
};
export const Unchanged: Story = {
  args: { fields: [{ label: "Model", old: "ThinkPad", new: "ThinkPad" }] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No tracked field changes recorded.")).toBeVisible();
  },
};
export const UnknownChange: Story = { args: { entry: { assetId: 42 } } };
export const Backdrop: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(canvasElement.querySelector(".absolute")!);
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
