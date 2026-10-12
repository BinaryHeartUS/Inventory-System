import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { FilterPopover } from "./FilterPopover";

const meta = {
  component: FilterPopover,
  args: { label: "Year", active: false, children: <input aria-label="Year from" /> },
} satisfies Meta<typeof FilterPopover>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ToggleAndEscape: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Year" });
    await userEvent.click(trigger);
    await expect(canvas.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};
export const Active: Story = {
  args: { active: true },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button"));
  },
};
export const Wide: Story = {
  args: { wide: true },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button"));
  },
};
export const RightAligned: Story = {
  args: { wide: true },
  decorators: [
    (Story) => (
      <div className="flex justify-end">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button"));
  },
};
export const OutsideClick: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button"));
    await userEvent.click(document.body);
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
