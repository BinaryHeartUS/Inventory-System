import { createRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import ScannerView from "./ScannerView";

const meta = {
  component: ScannerView,
  render: (args) => <ScannerView {...args} videoRef={createRef<HTMLVideoElement>()} />,
  args: {
    videoRef: { current: null },
    error: null,
    ready: false,
    torchSupported: false,
    torchOn: false,
    onToggleTorch: fn(),
    onManualSubmit: fn(),
  },
} satisfies Meta<typeof ScannerView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Starting: Story = {};
export const Ready: Story = { args: { ready: true } };
export const Torch: Story = {
  args: { ready: true, torchSupported: true },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Turn on flashlight" }));
    await expect(args.onToggleTorch).toHaveBeenCalledOnce();
  },
};
export const TorchOn: Story = {
  args: { ready: true, torchSupported: true, torchOn: true },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Turn off flashlight" }));
    await expect(args.onToggleTorch).toHaveBeenCalledOnce();
  },
};
export const ManualEntry: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole("button", { name: "Go" })).toBeDisabled();
    await userEvent.type(canvas.getByRole("spinbutton"), "42");
    await userEvent.click(canvas.getByRole("button", { name: "Go" }));
    await expect(args.onManualSubmit).toHaveBeenCalledWith("42");
    await expect(canvas.getByRole("spinbutton")).toHaveValue(null);
  },
};
export const PermissionDenied: Story = { args: { error: "permission" } };
export const NoCamera: Story = { args: { error: "not-found" } };
export const InsecureConnection: Story = { args: { error: "insecure" } };
export const Unsupported: Story = { args: { error: "unsupported" } };
export const UnknownError: Story = { args: { error: "unknown" } };
