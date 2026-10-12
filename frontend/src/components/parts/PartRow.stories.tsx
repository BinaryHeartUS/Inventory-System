import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { withTable } from "../../stories/decorators";
import { part } from "../../stories/fixtures";
import { PartRow } from "./PartRow";

const meta = {
  component: PartRow,
  decorators: [withTable],
  args: { part, chapter: "Central", onSelect: fn() },
} satisfies Meta<typeof PartRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Purchased: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("row"));
    await expect(args.onSelect).toHaveBeenCalledWith(43);
  },
};
export const Donated: Story = {
  args: { part: { ...part, wasPurchased: false, acquisitionDate: null } },
};
export const Contained: Story = {
  args: { part: { ...part, containedIn: 42 }, onUnlink: fn() },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Unlink" }));
    await expect(args.onUnlink).toHaveBeenCalledOnce();
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
};
export const HiddenType: Story = {
  args: { hideTypeCol: true },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText("RAM")).not.toBeInTheDocument();
  },
};
