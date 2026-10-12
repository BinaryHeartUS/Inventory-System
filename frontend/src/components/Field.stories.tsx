import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Field } from "./Field";

const meta = { component: Field, args: { label: "Model", value: "ThinkPad" } } satisfies Meta<
  typeof Field
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("ThinkPad")).toBeVisible();
  },
};
export const Missing: Story = {
  args: { value: null },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("span")).toBeVisible();
  },
};
export const Zero: Story = {
  args: { value: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("0")).toBeVisible();
  },
};
