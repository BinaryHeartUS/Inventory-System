import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { device } from "../../stories/fixtures";
import { DeviceList } from "./DeviceList";

const meta = {
  component: DeviceList,
  args: {
    devices: [
      device,
      {
        ...device,
        id: 10,
        manufacturer: "Dell",
        model: "Latitude",
        year: 2020,
        status: "Not Started",
        ram: 8,
        cpu: null,
      },
    ],
    onSelect: fn(),
  },
} satisfies Meta<typeof DeviceList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SortAndSelect: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getAllByRole("row")[1]).toHaveTextContent("10");
    await userEvent.click(canvas.getByText("ID", { exact: true }));
    await expect(canvas.getAllByRole("row")[1]).toHaveTextContent("42");
    await userEvent.click(canvas.getByText("ThinkPad"));
    await expect(args.onSelect).toHaveBeenCalledWith(42);
    await userEvent.click(canvas.getByText("Brand", { exact: true }));
    await expect(canvas.getAllByRole("row")[1]).toHaveTextContent("Dell");
  },
};
export const ControlledSort: Story = {
  args: { sortKey: "id", sortDir: "asc", onSort: fn() },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByText("ID", { exact: true }));
    await expect(args.onSort).toHaveBeenCalledWith("id", "desc");
  },
};
export const ControlledDescending: Story = {
  args: { sortKey: "id", sortDir: "desc", onSort: fn() },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByText("ID", { exact: true }));
    await expect(args.onSort).toHaveBeenCalledWith("id", "asc");
  },
};
export const Empty: Story = { args: { devices: [] } };
export const CustomEmpty: Story = {
  args: { devices: [], emptyMessage: <strong>No matches</strong> },
};
export const HiddenColumns: Story = { args: { exclude: ["CPU", "RAM", "Storage", "Details"] } };
export const Bounded: Story = {
  args: { bounded: true, scrollFooter: <p>Loading more devices</p> },
};
export const Stuck: Story = { args: { devices: [{ ...device, deviceStuck: true }] } };
