import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import DeviceValueChart from "./DeviceValueChart";

const now = new Date();
const meta = {
  component: DeviceValueChart,
  args: { data: [{ year: now.getFullYear(), month: now.getMonth() + 1, value: 2500 }] },
} satisfies Meta<typeof DeviceValueChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Values: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("$2,500")).toBeVisible();
    await waitFor(() => expect(canvasElement.querySelector(".recharts-surface")).toBeVisible());
  },
};
export const Empty: Story = {
  args: { data: [] },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No value data recorded yet")).toBeVisible();
  },
};
export const Zero: Story = {
  args: { data: [{ year: now.getFullYear(), month: now.getMonth() + 1, value: 0 }] },
};
export const OutsideRange: Story = { args: { data: [{ year: 2000, month: 1, value: 100 }] } };
export const SixMonths: Story = { args: { months: 6 } };
