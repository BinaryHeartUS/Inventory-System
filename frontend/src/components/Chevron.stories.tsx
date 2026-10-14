import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Chevron } from "./Chevron";

const meta = {
  component: Chevron,
  args: { expanded: false },
  play: async ({ canvasElement, args }) => {
    await expect(canvasElement.querySelector("svg")).toBeVisible();
    await expect(canvasElement.querySelector("svg")?.classList.contains("rotate-90")).toBe(
      args.expanded
    );
  },
} satisfies Meta<typeof Chevron>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Collapsed: Story = {};
export const Expanded: Story = { args: { expanded: true } };
