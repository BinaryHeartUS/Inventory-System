import { createRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { device } from "../../stories/fixtures";
import { DevicePickerModal } from "./DevicePickerModal";

const meta = {
  component: DevicePickerModal,
  render: (args) => <DevicePickerModal {...args} sentinelRef={createRef<HTMLDivElement>()} />,
  args: {
    devices: [device],
    loading: false,
    initialLoading: false,
    search: "",
    onSearchChange: fn(),
    sentinelRef: { current: null },
    onSelect: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof DevicePickerModal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Select: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByText("ThinkPad"));
    await expect(args.onSelect).toHaveBeenCalledWith(device);
  },
};
export const Search: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByRole("textbox"), "A");
    await expect(args.onSearchChange).toHaveBeenCalledWith("A");
  },
};
export const Chapter: Story = { args: { chapterName: "Central" } };
export const InitialLoading: Story = { args: { initialLoading: true } };
export const LoadingMore: Story = { args: { loading: true } };
export const Empty: Story = { args: { devices: [] } };
export const NoMatches: Story = { args: { devices: [], search: "missing" } };
export const Cancel: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(canvasElement.querySelector(".absolute")!);
    await expect(args.onCancel).toHaveBeenCalledOnce();
  },
};
