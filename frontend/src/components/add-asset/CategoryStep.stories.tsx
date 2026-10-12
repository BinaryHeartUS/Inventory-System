import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { CategoryStep } from "./CategoryStep";

const meta = { component: CategoryStep, args: { onSelect: fn() } } satisfies Meta<
  typeof CategoryStep
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Categories: Story = {
  play: async ({ canvas, args }) => {
    for (const category of ["Device", "Part", "Tool", "Misc"]) {
      await userEvent.click(canvas.getByRole("button", { name: new RegExp(`^${category} `) }));
      await expect(args.onSelect).toHaveBeenLastCalledWith(category);
    }
  },
};
