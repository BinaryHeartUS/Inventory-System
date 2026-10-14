import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { withTable } from "../../stories/decorators";
import { device } from "../../stories/fixtures";
import { DeviceRow, DesktopRow, LaptopRow, TabletRow } from "./DeviceRow";

const meta = {
  component: DeviceRow,
  decorators: [withTable],
  args: { device, extraCells: null, onSelect: fn() },
} satisfies Meta<typeof DeviceRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("row"));
    await expect(args.onSelect).toHaveBeenCalledWith(42);
  },
};
export const Desktop: Story = {
  args: { device: { ...device, type: "Desktop", hasWifi: true } },
  render: (args) => <DesktopRow {...args} />,
};
export const DesktopNoWifi: Story = {
  args: { device: { ...device, type: "Desktop", hasWifi: false } },
  render: (args) => <DesktopRow {...args} />,
};
export const DesktopUnknownWifi: Story = {
  args: { device: { ...device, type: "Desktop", hasWifi: null } },
  render: (args) => <DesktopRow {...args} />,
};
export const Laptop: Story = { render: (args) => <LaptopRow {...args} /> };
export const LaptopUnknownBattery: Story = {
  args: { device: { ...device, batteryHealth: null } },
  render: (args) => <LaptopRow {...args} />,
};
export const Mobile: Story = {
  args: { device: { ...device, type: "Tablet", workingBattery: "Yes" } },
  render: (args) => <TabletRow {...args} />,
};
export const MissingValues: Story = {
  args: {
    device: {
      ...device,
      cpu: null,
      operatingSystem: null,
      ramGeneration: null,
      storageType: null,
      acquisitionDate: null,
    },
  },
};
export const HardDrive: Story = { args: { device: { ...device, storageType: "HDD" } } };
export const Stuck: Story = { args: { device: { ...device, deviceStuck: true } } };
export const HiddenColumns: Story = {
  args: {
    exclude: [
      "ID",
      "Type",
      "Brand",
      "Model",
      "Year",
      "CPU",
      "OS",
      "RAM",
      "Storage",
      "Status",
      "Chapter",
      "Acquired",
      "Details",
    ],
  },
  render: (args) => <DesktopRow {...args} />,
};
export const LaptopHiddenDetails: Story = {
  args: { exclude: ["Details"] },
  render: (args) => <LaptopRow {...args} />,
};
export const MobileHiddenDetails: Story = {
  args: { exclude: ["Details"] },
  render: (args) => <TabletRow {...args} />,
};
