import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import type { DeviceStatus } from "../types/inventory";
import StatusBadge, { STATUS_CONFIG } from "./StatusBadge";

const statuses = Object.keys(STATUS_CONFIG) as DeviceStatus[];

const meta = { component: StatusBadge, args: { status: null } } satisfies Meta<typeof StatusBadge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const status of statuses) await expect(canvas.getByText(status)).toBeVisible();
  },
};
export const Large: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <StatusBadge key={status} status={status} size="lg" />
      ))}
    </div>
  ),
};
export const Missing: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toBeEmptyDOMElement();
  },
};
export const Unsupported: Story = {
  args: { status: "Unsupported status" as DeviceStatus },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toBeEmptyDOMElement();
  },
};
