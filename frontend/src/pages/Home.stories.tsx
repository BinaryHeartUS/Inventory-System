import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { withRouter } from "../stories/decorators";
import Home from "./Home";

const meta = { component: Home, decorators: [withRouter] } satisfies Meta<typeof Home>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Home" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  },
};
