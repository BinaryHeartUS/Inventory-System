import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { DEFAULT_DEVICE_STATUSES, DEVICE_STATUS_OPTIONS } from "./deviceFilters";
import { StatusFilterMenu } from "./StatusFilterMenu";

const meta = {
  component: StatusFilterMenu,
  args: {
    selected: [...DEFAULT_DEVICE_STATUSES],
    onChange: fn(),
    showStuck: false,
    onShowStuckChange: fn(),
  },
} satisfies Meta<typeof StatusFilterMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Stuck only" }));
    await expect(args.onShowStuckChange).toHaveBeenCalledWith(true);
  },
};
export const StuckOnly: Story = {
  args: { showStuck: true },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Stuck only" }));
    await expect(args.onShowStuckChange).toHaveBeenCalledWith(false);
  },
};
export const AllStatuses: Story = { args: { selected: [...DEVICE_STATUS_OPTIONS] } };
export const SingleStatus: Story = { args: { selected: [DEVICE_STATUS_OPTIONS[0]] } };
