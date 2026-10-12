import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { ExportCard } from "./ExportCard";
import { downloadCsv } from "../../utils/csv";

const meta = {
  component: ExportCard,
  args: {
    title: "Devices",
    icon: null,
    description: "Device inventory",
    count: 42,
    colorText: "text-green-700",
    colorBg: "bg-green-50",
    onExport: fn(),
    busy: false,
    loading: false,
  },
} satisfies Meta<typeof ExportCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Ready: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Download CSV (42 rows)" }));
    await expect(args.onExport).toHaveBeenCalledOnce();
  },
};
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
};
export const Preparing: Story = {
  args: { busy: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
};
export const Empty: Story = {
  args: { count: 0 },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "No data to export" })).toBeDisabled();
  },
};
export const BrowserDownload: Story = {
  args: { onExport: fn(() => downloadCsv("devices.csv", ["ID", "Model"], [[42, "ThinkPad"]])) },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button"));
    await expect(args.onExport).toHaveBeenCalledOnce();
  },
};
