import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { LoadingSpinner } from "./LoadingSpinner";

const meta = { component: LoadingSpinner } satisfies Meta<typeof LoadingSpinner>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Loading: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".animate-spin")).toBeVisible();
  },
};
