import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { withRouter } from "../stories/decorators";
import { NotFound } from "./NotFound";

const meta = {
  component: NotFound,
  decorators: [withRouter],
  args: { entity: "Device", id: 42, backTo: "/devices", backLabel: "Devices" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Device not found")).toBeVisible();
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "/devices");
  },
} satisfies Meta<typeof NotFound>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const MissingId: Story = { args: { id: undefined } };
