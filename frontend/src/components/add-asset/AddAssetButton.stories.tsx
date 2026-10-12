import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import AddAssetButton from "./AddAssetButton";

const meta = { component: AddAssetButton, args: { onClick: fn() } } satisfies Meta<
  typeof AddAssetButton
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
export const FullWidth: Story = { args: { className: "w-full" } };
