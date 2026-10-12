import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import FilterSelect from "./FilterSelect";

const meta = {
  component: FilterSelect,
  args: {
    "aria-label": "Status",
    defaultValue: "all",
    onChange: fn(),
    children: (
      <>
        <option value="all">All statuses</option>
        <option value="ready">Ready</option>
      </>
    ),
  },
} satisfies Meta<typeof FilterSelect>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.selectOptions(canvas.getByRole("combobox"), "ready");
    await expect(canvas.getByRole("combobox")).toHaveValue("ready");
    await expect(args.onChange).toHaveBeenCalledOnce();
  },
};
export const Disabled: Story = { args: { disabled: true } };
