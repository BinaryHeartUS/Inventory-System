import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { withTable } from "../stories/decorators";
import { ModificationLogRow } from "./ModificationLogRow";

const meta = {
  component: ModificationLogRow,
  decorators: [withTable],
  args: {
    entry: {
      assetId: 42,
      changeType: "Update",
      modifiedAt: "2026-01-15T12:00:00Z",
      modifiedBy: "Alex",
    },
    onViewMore: fn(),
  },
} satisfies Meta<typeof ModificationLogRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Update: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "View more" }));
    await expect(args.onViewMore).toHaveBeenCalledOnce();
  },
};
export const Insert: Story = { args: { entry: { assetId: 42, changeType: "Insert" } } };
export const Delete: Story = { args: { entry: { assetId: 42, changeType: "Delete" } } };
export const MissingMetadata: Story = { args: { entry: { assetId: 42 } } };
export const UnknownChange: Story = { args: { entry: { assetId: 42, changeType: "Restore" } } };
