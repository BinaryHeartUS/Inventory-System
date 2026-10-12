import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { DEVICE_TYPES } from "./deviceFilters";
import { DeviceTypeFilterMenu } from "./DeviceTypeFilterMenu";

const meta = {
  component: DeviceTypeFilterMenu,
  args: { selected: [...DEVICE_TYPES], onChange: fn() },
} satisfies Meta<typeof DeviceTypeFilterMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllTypes: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.click(canvas.getAllByRole("checkbox")[0]);
    await expect(args.onChange).toHaveBeenCalledWith(DEVICE_TYPES.slice(1));
  },
};
export const SingleType: Story = {
  args: { selected: [DEVICE_TYPES[0]] },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expect(canvas.getAllByRole("checkbox")[0]).toBeDisabled();
  },
};
