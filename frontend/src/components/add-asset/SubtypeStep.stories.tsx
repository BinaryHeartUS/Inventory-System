import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { SubtypeStep } from "./SubtypeStep";

const meta = { component: SubtypeStep, args: { onSelect: fn() } } satisfies Meta<
  typeof SubtypeStep
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Subtypes: Story = {
  play: async ({ canvas, args }) => {
    for (const [label, subtype] of [
      ["Desktop", "Desktop"],
      ["Laptop", "Laptop"],
      ["Mobile Device", "Tablet"],
    ]) {
      await userEvent.click(canvas.getByRole("button", { name: new RegExp(`^${label} `) }));
      await expect(args.onSelect).toHaveBeenLastCalledWith(subtype);
    }
  },
};
