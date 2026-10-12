import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { withTable } from "../../stories/decorators";
import { tool } from "../../stories/fixtures";
import { ToolRow } from "./ToolRow";

const meta = {
  component: ToolRow,
  decorators: [withTable],
  args: { tool, chapter: "Central", onSelect: fn() },
} satisfies Meta<typeof ToolRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("row"));
    await expect(args.onSelect).toHaveBeenCalledWith(44);
    await expect(canvas.getByText("$10.00")).toBeVisible();
  },
};
export const MissingValues: Story = {
  args: { tool: { ...tool, value: null, acquisitionDate: null } },
};
export const ZeroValue: Story = { args: { tool: { ...tool, value: 0 } } };
