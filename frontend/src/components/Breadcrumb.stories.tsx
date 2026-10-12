import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { withRouter } from "../stories/decorators";
import { Breadcrumb } from "./Breadcrumb";

const meta = {
  component: Breadcrumb,
  decorators: [withRouter],
  args: { backHref: "/devices", backLabel: "Devices", current: "Laptop #42" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Devices" })).toHaveAttribute("href", "/devices");
    await expect(canvas.getByText("Laptop #42")).toBeVisible();
  },
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
