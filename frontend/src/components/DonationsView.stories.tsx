import { createRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { device } from "../stories/fixtures";
import DonationsView from "./DonationsView";

const meta = {
  component: DonationsView,
  render: (args) => <DonationsView {...args} sentinelRef={createRef<HTMLDivElement>()} />,
  args: {
    chapters: [{ id: 1, name: "Central" }],
    summary: [],
    totalDonated: 1,
    donated: [{ ...device, status: "Donated" }],
    loading: false,
    sentinelRef: { current: null },
    chapterFilter: "All",
    onChapterChange: fn(),
    onOpenDevice: fn(),
  },
} satisfies Meta<typeof DonationsView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Donated: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByText("ThinkPad"));
    await expect(args.onOpenDevice).toHaveBeenCalledWith(42);
    await userEvent.selectOptions(canvas.getByRole("combobox"), "1");
    await expect(args.onChapterChange).toHaveBeenCalledWith(1);
    await userEvent.selectOptions(canvas.getByRole("combobox"), "All");
    await expect(args.onChapterChange).toHaveBeenLastCalledWith("All");
  },
};
export const Empty: Story = { args: { donated: [], totalDonated: 0 } };
export const Loading: Story = { args: { donated: [], loading: true } };
export const Multiple: Story = {
  args: {
    donated: [
      device,
      { ...device, id: 46, type: "Desktop" },
      { ...device, id: 47, type: "Tablet" },
    ],
    totalDonated: 3,
  },
};
