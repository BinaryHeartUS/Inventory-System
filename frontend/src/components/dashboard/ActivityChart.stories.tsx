import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";
import ActivityChart from "./ActivityChart";

const now = new Date();
const meta = {
  component: ActivityChart,
  args: {
    receivedData: [{ year: now.getFullYear(), month: now.getMonth() + 1, count: 10 }],
    donatedData: [{ year: now.getFullYear(), month: now.getMonth() + 1, count: 5 }],
  },
} satisfies Meta<typeof ActivityChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Activity: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector(".recharts-surface")).toBeVisible());
  },
};
export const Empty: Story = { args: { receivedData: [], donatedData: [] } };
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll(".animate-pulse")).toHaveLength(12);
  },
};
export const SixMonths: Story = { args: { months: 6 } };
