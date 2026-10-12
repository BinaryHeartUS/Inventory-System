import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { withRouter } from "../stories/decorators";
import About from "./About";

const meta = { component: About, decorators: [withRouter] } satisfies Meta<typeof About>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "About" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  },
};
