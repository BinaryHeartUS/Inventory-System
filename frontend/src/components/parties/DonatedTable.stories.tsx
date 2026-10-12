import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { withRouter } from "../../stories/decorators";
import { DonatedTable } from "./DonatedTable";

const meta = {
  component: DonatedTable,
  decorators: [withRouter],
  args: {
    rows: [
      { id: 42, label: "ThinkPad", detail: "16GB", value: 250, acquired: "2026-01-15" },
      { id: 43, label: "Latitude", detail: "", value: null, acquired: null, deviceStuck: true },
    ],
    basePath: "/devices",
    emptyMessage: "No donations",
    selectMode: false,
    selected: new Set<number>(),
    onToggle: fn(),
    onToggleAll: fn(),
  },
} satisfies Meta<typeof DonatedTable>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Selection: Story = {
  args: { selectMode: true },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getAllByRole("checkbox")[1]);
    await expect(args.onToggle).toHaveBeenCalledWith(42);
    await userEvent.click(canvas.getAllByRole("checkbox")[0]);
    await expect(args.onToggleAll).toHaveBeenCalledWith([42, 43]);
  },
};
export const AllSelected: Story = {
  args: { selectMode: true, selected: new Set([42, 43]) },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("checkbox")[0]).toBeChecked();
  },
};
export const PartlySelected: Story = { args: { selectMode: true, selected: new Set([42]) } };
export const Empty: Story = { args: { rows: [] } };
