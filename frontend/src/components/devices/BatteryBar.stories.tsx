import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { BatteryBar } from "./BatteryBar";

const meta = {
  component: BatteryBar,
  args: { health: 0.9 },
  play: async ({ canvas, args }) => {
    if (args.health !== null)
      await expect(canvas.getByText(`${Math.round(args.health * 100)}%`)).toBeVisible();
  },
} satisfies Meta<typeof BatteryBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Healthy: Story = {};
export const Moderate: Story = { args: { health: 0.65 } };
export const Low: Story = { args: { health: 0.25 } };
export const Zero: Story = { args: { health: 0 } };
export const Missing: Story = { args: { health: null } };
export const Rounding: Story = { args: { health: 0.795 } };
