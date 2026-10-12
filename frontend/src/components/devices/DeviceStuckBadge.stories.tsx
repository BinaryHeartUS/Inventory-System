import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { DeviceStuckBadge } from "./DeviceStuckBadge";

const meta = {
  component: DeviceStuckBadge,
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Device stuck")).toHaveAttribute(
      "title",
      "This device has had no recent activity"
    );
  },
} satisfies Meta<typeof DeviceStuckBadge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Small: Story = {};
export const Large: Story = { args: { size: "lg" } };
