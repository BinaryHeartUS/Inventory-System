import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import ChapterTabs from "./ChapterTabs";

const meta = {
  component: ChapterTabs,
  args: { chapters: ["Central", "West"], selected: "All", onChange: fn() },
} satisfies Meta<typeof ChapterTabs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const All: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "West" }));
    await expect(args.onChange).toHaveBeenCalledWith("West");
    await userEvent.click(canvas.getByRole("button", { name: "All Chapters" }));
    await expect(args.onChange).toHaveBeenLastCalledWith("All");
  },
};
export const Selected: Story = { args: { selected: "Central" } };
export const Empty: Story = { args: { chapters: [] } };
