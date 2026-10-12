import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { withRouter } from "../../stories/decorators";
import { AssetTable } from "./AssetTable";

const meta = {
  component: AssetTable,
  decorators: [withRouter],
  args: {
    rows: [
      {
        id: 42,
        label: "ThinkPad",
        detail: "16GB",
        status: "In Progress",
        chapter: "Central",
        acquired: "2026-01-15",
      },
    ],
    basePath: "/devices",
    emptyMessage: "No assets",
  },
} satisfies Meta<typeof AssetTable>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Devices: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "/devices/42");
  },
};
export const Stuck: Story = {
  args: { rows: [{ id: 42, label: "ThinkPad", detail: "", acquired: null, deviceStuck: true }] },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Device stuck")).toBeVisible();
  },
};
export const NoOptionalColumns: Story = {
  args: { rows: [{ id: 43, label: "RAM", detail: "", acquired: null }], basePath: "/parts" },
};
export const Empty: Story = {
  args: { rows: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No assets")).toBeVisible();
  },
};
